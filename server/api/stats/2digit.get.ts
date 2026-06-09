import { getSupabaseAdmin } from "~/server/utils/supabase";
import { assignLabels, computePercentile } from "~/server/utils/stats";
import { validateScope } from "~/server/utils/validation";
import { validateMonth, validateDay } from "~/server/utils/validation-helpers";
import type { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const scope = validateScope((query.scope as string) ?? "5y");
	const type = (query.type as string) ?? "last2";
	const month = validateMonth(query.month);
	const day = validateDay(query.day);

	if (type !== "last2" && type !== "first2") {
		throw createError({ statusCode: 400, message: "Invalid type. Must be 'last2' or 'first2'" });
	}

	const cacheKey = `2digit_${type}:${scope}${month ? `_m${month}` : ""}${day ? `_d${day}` : ""}`;

	const db = getSupabaseAdmin();

	const { data: cached } = await db
		.from("stats_cache")
		.select("data_json, computed_at")
		.eq("stat_type", `2digit_${type}`)
		.eq("scope", `${scope}${month ? `_m${month}` : ""}${day ? `_d${day}` : ""}`)
		.maybeSingle();

	if (cached) {
		return { data: cached.data_json, cached_at: cached.computed_at };
	}

	const col = type === "first2" ? "first" : "last2";

	const { data: rows, error } = await db.rpc("get_2digit_stats", {
		p_col: col,
		p_scope: scope,
		p_month: month ?? null,
		p_day: day ?? null,
	});

	if (error) {
		throw createError({ statusCode: 500, message: error.message });
	}

	const items = (rows ?? []).map((r) => ({
		number: r.number,
		count: r.count,
		last_draw: r.last_draw,
		gap: r.gap,
		pct: r.pct,
	}));

	const counts = items.map((i) => i.count);
	const hotThreshold = computePercentile(counts, 90);
	const coldThreshold = computePercentile(counts, 10);
	const ranking = assignLabels(items);

	const result = { ranking, total_draws: rows?.length ?? 0, hot_threshold: hotThreshold, cold_threshold: coldThreshold };

	await db.from("stats_cache").upsert({
		stat_type: `2digit_${type}`,
		scope: cacheKey.split(":")[1],
		data_json: result as unknown as Database["public"]["Tables"]["stats_cache"]["Insert"]["data_json"],
		computed_at: new Date().toISOString(),
	});

	return { data: result, cached_at: new Date().toISOString() };
});
