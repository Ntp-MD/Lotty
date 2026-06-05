import { getSupabaseAdmin } from "~/server/utils/supabase";
import { assignLabels, computePercentile } from "~/server/utils/stats";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const scope = (query.scope as string) ?? "5y";
  const type = (query.type as string) ?? "last2";
  const month = query.month ? Number(query.month) : undefined;
  const day = query.day as string | undefined;

  const cacheKey = `2digit_${type}:${scope}${month ? `_m${month}` : ""}${day ? `_d${day}` : ""}`;

  const db = getSupabaseAdmin();

  const { data: cached } = await (db as any)
    .from("stats_cache")
    .select("data_json, computed_at")
    .eq("stat_type", `2digit_${type}`)
    .eq("scope", `${scope}${month ? `_m${month}` : ""}${day ? `_d${day}` : ""}`)
    .maybeSingle();

  if (cached) {
    return { data: cached.data_json, cached_at: cached.computed_at };
  }

  const col = type === "first2" ? "first" : "last2";

  const { data: rows, error } = await (db as any).rpc("get_2digit_stats", {
    p_col: col,
    p_scope: scope,
    p_month: month ?? null,
    p_day: day ?? null,
  });

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  const items = (rows ?? []).map((r: { number: string; count: number; last_draw: string; gap: number; pct: number }) => ({
    number: r.number,
    count: r.count,
    last_draw: r.last_draw,
    gap: r.gap,
    pct: r.pct,
  }));

  const counts = items.map((i: { count: number }) => i.count);
  const hotThreshold = computePercentile(counts, 90);
  const coldThreshold = computePercentile(counts, 10);
  const ranking = assignLabels(items);

  const result = { ranking, total_draws: rows?.length ?? 0, hot_threshold: hotThreshold, cold_threshold: coldThreshold };

  await (db as any).from("stats_cache").upsert({
    stat_type: `2digit_${type}`,
    scope: cacheKey.split(":")[1],
    data_json: result,
    computed_at: new Date().toISOString(),
  });

  return { data: result, cached_at: new Date().toISOString() };
});
