import { getSupabaseAdmin } from "~/server/utils/supabase";

export default defineEventHandler(async (event) => {
  const db = getSupabaseAdmin();

  const { data, error } = await db
    .from("draws")
    .select("draw_date, first, last2, last3f, last3b")
    .order("draw_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw createError({ statusCode: 500, message: "Failed to fetch latest draw" });
  }

  if (!data) {
    return { data: null };
  }

  return { data };
});
