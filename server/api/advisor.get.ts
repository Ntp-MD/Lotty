import { getSupabaseAdmin } from "~/server/utils/supabase";
import { nextDrawDate } from "~/server/utils/stats";
import { readStatsCache, writeStatsCache } from "~/server/utils/cache";
import { validateScope } from "~/server/utils/validation";

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const scope = validateScope((query.scope as string) ?? "5y");

	const db = getSupabaseAdmin();

	const cached = await readStatsCache(db, "advisor", scope);
	if (cached) return { data: cached.data, cached_at: cached.computedAt };

	const [r2, r3b, r3f] = await Promise.all([
		db.rpc("get_2digit_stats", { p_col: "last2", p_scope: scope, p_month: null, p_day: null }),
		db.rpc("get_3digit_stats", { p_col: "last3b", p_scope: scope, p_month: null }),
		db.rpc("get_3digit_stats", { p_col: "last3f", p_scope: scope, p_month: null }),
	]);

	if (r2.error || r3b.error || r3f.error) {
		throw createError({ statusCode: 500, message: "Failed to compute advisor" });
	}

	function topByGap(rows: { number: string; gap: number; avg_gap?: number }[]) {
		const sorted = [...(rows ?? [])].sort((a, b) => b.gap - a.gap);
		const top = sorted[0];
		return { number: top?.number ?? "?", gap: top?.gap ?? 0, avg_gap: top?.avg_gap ?? 0 };
	}

	const result = {
		draw_date_next: nextDrawDate(),
		suggestions: { last2: topByGap(r2.data ?? []), last3b: topByGap(r3b.data ?? []), last3f: topByGap(r3f.data ?? []) },
		rationale: `Recommended numbers are those with the longest gap in the ${scope} period (longest time without appearing compared to average)`,
	};

	await writeStatsCache(db, "advisor", scope, result);

	return { data: result, cached_at: new Date().toISOString() };
});
