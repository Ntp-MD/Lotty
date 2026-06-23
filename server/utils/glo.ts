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

	// Validate the third-party payload before we let it into the database. A
	// malformed response (broken upstream / MitM / future API change) could
	// otherwise persist non-numeric junk that breaks every downstream stat.
	const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
	const isDigits = (n: number) => (s: string) => typeof s === "string" && new RegExp(`^\\d{${n}}$`).test(s);
	const isFirst6 = isDigits(6);
	const isD2 = isDigits(2);
	const isD3 = isDigits(3);

	const row = {
		draw_date: drawDate,
		first: firstValue(prizes.first),
		last2: firstValue(prizes.last2),
		last3f: firstValue(prizes.last3f),
		last3b: firstValue(prizes.last3b),
		// Filter array prizes to only well-formed 6-digit strings to keep the
		// digit-frequency RPC honest.
		second: allValues(prizes.second).filter(isFirst6),
		third: allValues(prizes.third).filter(isFirst6),
		fourth: allValues(prizes.fourth).filter(isFirst6),
		fifth: allValues(prizes.fifth).filter(isFirst6),
		near1: allValues(prizes.near1).filter(isFirst6),
	};

	if (
		!ISO_DATE.test(row.draw_date) ||
		!isFirst6(row.first) ||
		!isD2(row.last2) ||
		!isD3(row.last3f) ||
		!isD3(row.last3b)
	) {
		logger.warn("GLO payload failed schema validation", {
			drawDate: row.draw_date,
			first: row.first,
			last2: row.last2,
			last3f: row.last3f,
			last3b: row.last3b,
		});
		return {
			status: "not_ready",
			draw_date: null,
			detail: "schema validation failed (date or core prize values are not numeric)",
		};
	}

	const { data: existing } = await db.from("draws").select("id").eq("draw_date", row.draw_date).maybeSingle();
	if (existing) return { status: "already_exists", draw_date: row.draw_date };

	const { error } = await db.from("draws").insert(row);

	if (error) {
		logger.error("Failed to insert draw", { error: error.message, drawDate: row.draw_date });
		return { status: "error", draw_date: null, detail: `insert failed: ${error.message}` };
	}

	// `not('id','is',null)` matches every row without depending on id ordering
	// (BIGSERIAL happens to start at 1 today, but the predicate should not).
	const { error: cacheError } = await db.from("stats_cache").delete().not("id", "is", null);
	if (cacheError) {
		logger.warn("Failed to clear stats cache", { error: cacheError.message });
	}

	logger.info("Draw inserted successfully", { drawDate: row.draw_date });
	return { status: "inserted", draw_date: row.draw_date };
}
