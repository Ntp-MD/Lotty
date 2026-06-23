import { getSupabaseAdmin } from "~/server/utils/supabase";
import { lastExpectedDrawDate } from "~/server/utils/stats";

export default defineEventHandler(async (event) => {
  const db = getSupabaseAdmin();

  try {
    const { data, error } = await db.from("draws").select("id").limit(1);

    if (error) {
      // Return 503 so external monitors that key on HTTP status (Vercel,
      // UptimeRobot, Pingdom, …) actually alert on the failure instead of
      // treating an unhealthy 200 as success.
      setResponseStatus(event, 503);
      return {
        status: "unhealthy",
        database: "error",
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }

    void data;

    const { data: latestDraw } = await db
      .from("draws")
      .select("draw_date")
      .order("draw_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const expectedDate = lastExpectedDrawDate();
    const isUpToDate = !!latestDraw && latestDraw.draw_date >= expectedDate;

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
    setResponseStatus(event, 503);
    return {
      status: "unhealthy",
      database: "disconnected",
      timestamp: new Date().toISOString(),
      error: String(error),
    };
  }
});
