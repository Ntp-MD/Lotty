import { getSupabaseAdmin } from "~/server/utils/supabase";
import { syncLatestDrawFromGlo } from "~/server/utils/glo";
import { lastExpectedDrawDate } from "~/server/utils/stats";
import { logger } from "~/server/utils/logger";

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
  // Any failure here must NOT crash the request - we degrade gracefully and
  // return the stale (or null) cached data instead of a 500.
  if (!data || data.draw_date < lastExpectedDrawDate()) {
    try {
      const result = await syncLatestDrawFromGlo(db);
      if (result.status === "inserted") {
        data = await readLatest();
      }
    } catch (err) {
      logger.error("latest-draw on-demand sync failed", { err: err instanceof Error ? err.message : String(err) });
    }
  }

  return { data: data ?? null };
});
