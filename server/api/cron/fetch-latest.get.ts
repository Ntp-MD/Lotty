import { getSupabaseAdmin } from "~/server/utils/supabase";
import { logger } from "~/server/utils/logger";

const GLO_API = "https://www.glo.or.th/api/lottery/getLatestLottery";

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig();
	const auth = getHeader(event, "authorization");
	if (auth !== `Bearer ${config.cronSecret}`) {
		logger.warn("Unauthorized cron access attempt");
		throw createError({ statusCode: 401, message: "Unauthorized" });
	}

	logger.info("Cron job started: fetch-latest");

	let gloData;
	try {
		gloData = await $fetch<any>(GLO_API, { method: "POST", timeout: 10000 });
	} catch (error) {
		logger.error("GLO API fetch failed", { error: String(error) });
		throw createError({ statusCode: 503, message: "GLO API unavailable" });
	}

	const isSuccess = 
		gloData?.status === true || 
		gloData?.status?.code === "000" || 
		gloData?.statusCode === 200 || 
		gloData?.statusCode === "200";

	if (!isSuccess) {
		logger.warn("GLO API returned unsuccessful status", { status: gloData?.status, statusCode: gloData?.statusCode });
		return { status: "not_ready", draw_date: null };
	}

	const prizes = gloData.response?.prizes as any;
	const drawDate = (gloData.response?.date || "") as string;

	if (!prizes || !drawDate) {
		logger.info("GLO API results not ready yet (prizes or draw date missing)");
		return { status: "not_ready", draw_date: null };
	}

	const db = getSupabaseAdmin();

	const { data: existing } = await db.from("draws").select("id").eq("draw_date", drawDate).maybeSingle();
	if (existing) return { status: "already_exists", draw_date: drawDate };

	const { error } = await db.from("draws").insert({
		draw_date: drawDate,
		first: prizes.first?.number ?? "",
		last2: prizes.last2?.number ?? "",
		last3f: prizes.last3f?.number ?? "",
		last3b: prizes.last3b?.number ?? "",
		second: [],
		third: [],
		fourth: [],
		fifth: [],
		near1: [],
	});

	if (error) {
		logger.error("Failed to insert draw", { error: error.message, drawDate });
		throw createError({ statusCode: 500, message: error.message });
	}

	const { error: cacheError } = await db.from("stats_cache").delete().gt("id", 0);
	if (cacheError) {
		logger.warn("Failed to clear stats cache", { error: cacheError.message });
	}

	logger.info("Draw inserted successfully", { drawDate });
	return { status: "inserted", draw_date: drawDate };
});
