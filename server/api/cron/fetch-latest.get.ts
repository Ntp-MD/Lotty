import { getSupabaseAdmin } from "~/server/utils/supabase";
import { syncLatestDrawFromGlo } from "~/server/utils/glo";
import { logger } from "~/server/utils/logger";

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig();
	const auth = getHeader(event, "authorization");
	if (auth !== `Bearer ${config.cronSecret}`) {
		logger.warn("Unauthorized cron access attempt");
		throw createError({ statusCode: 401, message: "Unauthorized" });
	}

	logger.info("Cron job started: fetch-latest");

	const db = getSupabaseAdmin();
	const result = await syncLatestDrawFromGlo(db);

	if (result.status === "error") {
		throw createError({ statusCode: 503, message: "GLO API unavailable or insert failed" });
	}

	return result;
});
