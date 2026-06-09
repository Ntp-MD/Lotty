import { getSupabaseAdmin } from "~/server/utils/supabase";
import { validateScope } from "~/server/utils/validation";
import type { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const scope = validateScope((query.scope as string) ?? "5y");
	const pos = query.pos ? Number(query.pos) : undefined;

	if (pos !== undefined && (pos < 1 || pos > 6)) {
		throw createError({ statusCode: 400, message: "Invalid position. Must be 1-6" });
	}

	const db = getSupabaseAdmin();

	const { data: cached } = await db
		.from("stats_cache")
		.select("data_json, computed_at")
		.eq("stat_type", "digits_all")
		.eq("scope", scope)
		.maybeSingle();

	if (cached) {
		const cachedData = cached.data_json as Array<{ position: number }>;
		const result = pos ? cachedData.filter((d) => d.position === pos) : cachedData;
		return { data: result, cached_at: cached.computed_at };
	}

	const { data: rows, error } = await db.rpc("get_digit_stats", { p_scope: scope });
	if (error) throw createError({ statusCode: 500, message: error.message });

	await db.from("stats_cache").upsert({
		stat_type: "digits_all",
		scope,
		data_json: rows as unknown as Database["public"]["Tables"]["stats_cache"]["Insert"]["data_json"],
		computed_at: new Date().toISOString(),
	});

	const result = pos ? (rows ?? []).filter((d) => d.position === pos) : rows;
	return { data: result ?? [], cached_at: new Date().toISOString() };
});
