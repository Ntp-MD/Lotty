import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/types/supabase";
import { logger } from "~/server/utils/logger";

type DB = SupabaseClient<Database>;
type CacheJson = Database["public"]["Tables"]["stats_cache"]["Insert"]["data_json"];

export async function readStatsCache<T>(
	db: DB,
	statType: string,
	scope: string,
): Promise<{ data: T; computedAt: string } | null> {
	const { data, error } = await db
		.from("stats_cache")
		.select("data_json, computed_at")
		.eq("stat_type", statType)
		.eq("scope", scope)
		.maybeSingle();

	if (error) {
		logger.warn("readStatsCache failed", { statType, scope, error: error.message });
		return null;
	}
	if (!data) return null;
	return { data: data.data_json as T, computedAt: data.computed_at };
}

export async function writeStatsCache(
	db: DB,
	statType: string,
	scope: string,
	data: unknown,
): Promise<void> {
	const { error } = await db.from("stats_cache").upsert({
		stat_type: statType,
		scope,
		data_json: data as CacheJson,
		computed_at: new Date().toISOString(),
	});
	if (error) {
		// Surface the failure (most commonly: anon key + RLS, or column type
		// mismatch). Without this log the cache silently never populates and
		// every request re-runs the expensive RPCs.
		logger.error("writeStatsCache failed", { statType, scope, error: error.message });
	}
}
