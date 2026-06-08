import { getSupabaseAdmin } from "~/server/utils/supabase";

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
    
    return {
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
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
