import { getSupabaseAdmin } from "~/server/utils/supabase";
import { nextDrawDate } from "~/server/utils/stats";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const scope = (query.scope as string) ?? "5y";

  const db = getSupabaseAdmin();

  const { data: cached } = await (db as any)
    .from("stats_cache")
    .select("data_json, computed_at")
    .eq("stat_type", "advisor")
    .eq("scope", scope)
    .maybeSingle();

  if (cached) return { data: cached.data_json, cached_at: cached.computed_at };

  const { data: rows2, error: e2 } = await (db as any).rpc("get_2digit_stats", { p_col: "last2", p_scope: scope, p_month: null, p_day: null });
  const { data: rows3b, error: e3b } = await (db as any).rpc("get_3digit_stats", { p_col: "last3b", p_scope: scope, p_month: null });
  const { data: rows3f, error: e3f } = await (db as any).rpc("get_3digit_stats", { p_col: "last3f", p_scope: scope, p_month: null });

  if (e2 || e3b || e3f) throw createError({ statusCode: 500, message: "Failed to compute advisor" });

  function topByGap(rows: { number: string; gap: number; avg_gap?: number }[]) {
    const sorted = [...(rows ?? [])].sort((a, b) => b.gap - a.gap);
    const top = sorted[0];
    return { number: top?.number ?? "?", gap: top?.gap ?? 0, avg_gap: top?.avg_gap ?? 0 };
  }

  const result = {
    draw_date_next: nextDrawDate(),
    suggestions: { last2: topByGap(rows2 ?? []), last3b: topByGap(rows3b ?? []), last3f: topByGap(rows3f ?? []) },
    rationale: `เลขที่แนะนำคือเลขที่ค้างนานที่สุดในช่วง ${scope} (ยังไม่ออกมานานที่สุดเมื่อเทียบกับค่าเฉลี่ย)`,
  };

  await (db as any).from("stats_cache").upsert({ stat_type: "advisor", scope, data_json: result, computed_at: new Date().toISOString() });

  return { data: result, cached_at: new Date().toISOString() };
});
