import { getSupabaseAdmin } from "~/server/utils/supabase";
import { computePercentile } from "~/server/utils/stats";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const number = (query.number as string)?.trim();
  const scope = (query.scope as string) ?? "5y";

  if (!number || (number.length !== 2 && number.length !== 3)) {
    throw createError({ statusCode: 400, message: "number must be 2 or 3 digits" });
  }

  const db = getSupabaseAdmin();
  const col = number.length === 2 ? "last2" : "last3b";

  const { data: rows, error } = await (db as any).rpc("get_lookup_stats", {
    p_number: number,
    p_col: col,
    p_scope: scope,
  });

  if (error) throw createError({ statusCode: 500, message: error.message });

  const row = rows?.[0];
  if (!row) return { data: null, cached_at: new Date().toISOString() };

  const { data: allRows } = await (db as any).rpc(number.length === 2 ? "get_2digit_stats" : "get_3digit_stats", {
    p_col: col, p_scope: scope, p_month: null, p_day: null,
  });

  const allCounts = (allRows ?? []).map((r: { count: number }) => r.count);
  const sorted = [...allCounts].sort((a: number, b: number) => b - a);
  const rank = sorted.indexOf(row.count) + 1;

  return {
    data: {
      number,
      count: row.count,
      last_draw: row.last_draw,
      gap: row.gap,
      rank,
      total: allCounts.length,
      label: row.count >= computePercentile(allCounts, 90) ? "hot" : row.count <= computePercentile(allCounts, 10) ? "cold" : "normal",
      history: row.history ?? [],
    },
    cached_at: new Date().toISOString(),
  };
});
