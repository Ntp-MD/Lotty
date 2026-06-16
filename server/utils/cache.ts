import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/types/supabase";

type DB = SupabaseClient<Database>;
type CacheJson = Database["public"]["Tables"]["stats_cache"]["Insert"]["data_json"];

export async function readStatsCache<T>(
	db: DB,
	statType: string,
	scope: string,
): Promise<{ data: T; computedAt: string } | null> {
	const { data } = await db
		.from("stats_cache")
		.select("data_json, computed_at")
		.eq("stat_type", statType)
		.eq("scope", scope)
		.maybeSingle();

	if (!data) return null;
	return { data: data.data_json as T, computedAt: data.computed_at };
}

export async function writeStatsCache(
	db: DB,
	statType: string,
	scope: string,
	data: unknown,
): Promise<void> {
	await db.from("stats_cache").upsert({
		stat_type: statType,
		scope,
		data_json: data as CacheJson,
		computed_at: new Date().toISOString(),
	});
}
