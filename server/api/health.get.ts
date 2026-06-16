import { getSupabaseAdmin } from "~/server/utils/supabase";
import { lastExpectedDrawDate } from "~/server/utils/stats";

export default defineEventHandler(async () => {
  const db = getSupabaseAdmin();

  try {
    const { data, error } = await db.from("draws").select("id").limit(1);

    if (error) {
      return {
        status: "unhealthy",
        database: "error",
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }

    const { data: latestDraw } = await db
      .from("draws")
      .select("draw_date")
      .order("draw_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const expectedDate = lastExpectedDrawDate();
    const isUpToDate = latestDraw && latestDraw.draw_date >= expectedDate;

    return {
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
      latest_draw: {
        stored_date: latestDraw?.draw_date ?? null,
        expected_date: expectedDate,
        is_up_to_date: isUpToDate,
      },
    };
  } catch (error) {
    return {
      status: "unhealthy",
      database: "disconnected",
      timestamp: new Date().toISOString(),
      error: String(error),
    };
  }
});
