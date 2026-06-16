import { getSupabaseAdmin } from "~/server/utils/supabase";
import { syncLatestDrawFromGlo } from "~/server/utils/glo";
import { lastExpectedDrawDate } from "~/server/utils/stats";

const DRAW_COLUMNS = "draw_date, first, last2, last3f, last3b";

export default defineEventHandler(async () => {
  const db = getSupabaseAdmin();

  const readLatest = async () => {
    const { data, error } = await db
      .from("draws")
      .select(DRAW_COLUMNS)
      .order("draw_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw createError({ statusCode: 500, message: "Failed to fetch latest draw" });
    return data;
  };

  let data = await readLatest();

  // On-demand refresh: if the stored draw is missing or older than the most
  // recent draw that should already be announced, pull fresh results from GLO.
  // This keeps the latest draw up to date without depending on the cron job.
  if (!data || data.draw_date < lastExpectedDrawDate()) {
    const result = await syncLatestDrawFromGlo(db);
    if (result.status === "inserted") {
      data = await readLatest();
    }
  }

  return { data: data ?? null };
});
