import { getSupabaseAdmin } from "~/server/utils/supabase";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const scope = (query.scope as string) ?? "5y";
  const pos = query.pos ? Number(query.pos) : undefined;

  const db = getSupabaseAdmin();

  const { data: cached } = await (db as any)
    .from("stats_cache")
    .select("data_json, computed_at")
    .eq("stat_type", "digits_all")
    .eq("scope", scope)
    .maybeSingle();

  if (cached) {
    const result = pos ? cached.data_json.filter((d: { position: number }) => d.position === pos) : cached.data_json;
    return { data: result, cached_at: cached.computed_at };
  }

  const { data: rows, error } = await (db as any).rpc("get_digit_stats", { p_scope: scope });
  if (error) throw createError({ statusCode: 500, message: error.message });

  await (db as any).from("stats_cache").upsert({
    stat_type: "digits_all",
    scope,
    data_json: rows,
    computed_at: new Date().toISOString(),
  });

  const result = pos ? (rows ?? []).filter((d: { position: number }) => d.position === pos) : rows;
  return { data: result ?? [], cached_at: new Date().toISOString() };
});
