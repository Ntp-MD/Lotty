import { timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "~/server/utils/supabase";
import { syncLatestDrawFromGlo } from "~/server/utils/glo";
import { logger } from "~/server/utils/logger";

function isAuthorized(header: string | undefined, secret: string | undefined): boolean {
	// Require an actual secret on the server side. Missing CRON_SECRET must
	// fail closed (never authenticate "Bearer " with an empty default).
	if (!secret) return false;
	if (!header) return false;
	const match = /^Bearer\s+(.+)$/.exec(header);
	if (!match) return false;
	const provided = Buffer.from(match[1]);
	const expected = Buffer.from(secret);
	// timingSafeEqual requires equal-length buffers.
	if (provided.length !== expected.length) return false;
	return timingSafeEqual(provided, expected);
}

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig();
	const auth = getHeader(event, "authorization");
	if (!isAuthorized(auth, config.cronSecret as string | undefined)) {
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
