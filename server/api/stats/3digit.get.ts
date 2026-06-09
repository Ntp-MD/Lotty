import { getSupabaseAdmin } from "~/server/utils/supabase";
import { assignLabels, computePercentile } from "~/server/utils/stats";
import { validateScope } from "~/server/utils/validation";
import { validateMonth } from "~/server/utils/validation-helpers";
import type { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const scope = validateScope((query.scope as string) ?? "5y");
	const type = (query.type as string) ?? "last3b";
	const month = validateMonth(query.month);

	if (type !== "last3b" && type !== "last3f") {
		throw createError({ statusCode: 400, message: "Invalid type. Must be 'last3b' or 'last3f'" });
	}

	const db = getSupabaseAdmin();
	const scopeKey = `${scope}${month ? `_m${month}` : ""}`;

	const { data: cached } = await db
		.from("stats_cache")
		.select("data_json, computed_at")
		.eq("stat_type", `3digit_${type}`)
		.eq("scope", scopeKey)
		.maybeSingle();

	if (cached) return { data: cached.data_json, cached_at: cached.computed_at };

	const { data: rows, error } = await db.rpc("get_3digit_stats", {
		p_col: type,
		p_scope: scope,
		p_month: month ?? null,
	});

	if (error) throw createError({ statusCode: 500, message: error.message });

	const items = (rows ?? []).map((r) => ({
		number: r.number, count: r.count, last_draw: r.last_draw, gap: r.gap, pct: r.pct,
	}));

	const counts = items.map((i) => i.count);
	const result = {
		ranking: assignLabels(items),
		total_draws: rows?.length ?? 0,
		hot_threshold: computePercentile(counts, 90),
		cold_threshold: computePercentile(counts, 10),
	};

	await db.from("stats_cache").upsert({
		stat_type: `3digit_${type}`,
		scope: scopeKey,
		data_json: result as unknown as Database["public"]["Tables"]["stats_cache"]["Insert"]["data_json"],
		computed_at: new Date().toISOString()
	});

	return { data: result, cached_at: new Date().toISOString() };
});
