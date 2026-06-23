import { getSupabaseAdmin } from "~/server/utils/supabase";
import { assignLabels, thresholdsFromCounts } from "~/server/utils/stats";
import { readStatsCache, writeStatsCache } from "~/server/utils/cache";
import { validateScope } from "~/server/utils/validation";
import { validateMonth } from "~/server/utils/validation-helpers";

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const scope = validateScope((query.scope as string) ?? "5y");
	const type = (query.type as string) ?? "last3b";
	const month = validateMonth(query.month);

	if (type !== "last3b" && type !== "last3f") {
		throw createError({ statusCode: 400, message: "Invalid type. Must be 'last3b' or 'last3f'" });
	}

	const db = getSupabaseAdmin();
	const statType = `3digit_${type}`;
	const scopeKey = `${scope}${month ? `_m${month}` : ""}`;

	const cached = await readStatsCache(db, statType, scopeKey);
	if (cached) return { data: cached.data, cached_at: cached.computedAt };

	const { data: rows, error } = await db.rpc("get_3digit_stats", {
		p_col: type,
		p_scope: scope,
		p_month: month ?? null,
	});

	if (error) throw createError({ statusCode: 500, message: error.message });

	const items = (rows ?? []).map((r) => ({
		number: r.number, count: r.count, last_draw: r.last_draw, gap: r.gap, pct: r.pct,
	}));

	const counts = items.map((i) => Number(i.count));
	const { hot, cold } = thresholdsFromCounts(counts);
	const result = {
		ranking: assignLabels(items),
		// rows.length is always 1000 (every three-digit number from `all_nums`).
		// The real draw count is the sum of observed counts.
		total_draws: counts.reduce((s, c) => s + c, 0),
		hot_threshold: hot,
		cold_threshold: cold,
	};

	await writeStatsCache(db, statType, scopeKey, result);

	return { data: result, cached_at: new Date().toISOString() };
});
