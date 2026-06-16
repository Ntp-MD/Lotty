import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/types/supabase";
import { logger } from "~/server/utils/logger";

const GLO_API = "https://www.glo.or.th/api/lottery/getLatestLottery";

type DB = SupabaseClient<Database>;

export type GloSyncStatus = "inserted" | "already_exists" | "not_ready" | "error";

export interface GloSyncResult {
	status: GloSyncStatus;
	draw_date: string | null;
	detail?: string;
}

/**
 * Fetches the latest results from the GLO API and, if a new draw is available,
 * inserts it into the `draws` table and clears the stats cache.
 * Shared by the scheduled cron job and the on-demand /api/latest-draw refresh.
 */
export async function syncLatestDrawFromGlo(db: DB): Promise<GloSyncResult> {
	let gloData: any;
	try {
		gloData = await $fetch<any>(GLO_API, { method: "POST", timeout: 10000 });
	} catch (error) {
		logger.error("GLO API fetch failed", { error: String(error) });
		return { status: "error", draw_date: null, detail: `fetch failed: ${String(error)}` };
	}

	const isSuccess =
		gloData?.status === true ||
		gloData?.status?.code === "000" ||
		gloData?.statusCode === 200 ||
		gloData?.statusCode === "200";

	if (!isSuccess) {
		logger.warn("GLO API returned unsuccessful status", { status: gloData?.status, statusCode: gloData?.statusCode });
		return { status: "not_ready", draw_date: null, detail: `unsuccessful status: ${JSON.stringify(gloData?.status ?? gloData?.statusCode ?? gloData)?.slice(0, 200)}` };
	}

	const prizes = gloData.response?.data as any;
	const drawDate = (gloData.response?.date || "") as string;

	const firstValue = (prize: any): string => prize?.number?.[0]?.value ?? "";
	const allValues = (prize: any): string[] => (prize?.number ?? []).map((n: any) => n?.value).filter(Boolean);

	if (!prizes || !drawDate || !firstValue(prizes.first)) {
		logger.info("GLO API results not ready yet (prizes or draw date missing)");
		return { status: "not_ready", draw_date: null, detail: `missing prizes/date (date=${drawDate || "empty"})` };
	}

	const { data: existing } = await db.from("draws").select("id").eq("draw_date", drawDate).maybeSingle();
	if (existing) return { status: "already_exists", draw_date: drawDate };

	const { error } = await db.from("draws").insert({
		draw_date: drawDate,
		first: firstValue(prizes.first),
		last2: firstValue(prizes.last2),
		last3f: firstValue(prizes.last3f),
		last3b: firstValue(prizes.last3b),
		second: allValues(prizes.second),
		third: allValues(prizes.third),
		fourth: allValues(prizes.fourth),
		fifth: allValues(prizes.fifth),
		near1: allValues(prizes.near1),
	});

	if (error) {
		logger.error("Failed to insert draw", { error: error.message, drawDate });
		return { status: "error", draw_date: null, detail: `insert failed: ${error.message}` };
	}

	const { error: cacheError } = await db.from("stats_cache").delete().gt("id", 0);
	if (cacheError) {
		logger.warn("Failed to clear stats cache", { error: cacheError.message });
	}

	logger.info("Draw inserted successfully", { drawDate });
	return { status: "inserted", draw_date: drawDate };
}
