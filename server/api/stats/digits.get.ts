import { getSupabaseAdmin } from "~/server/utils/supabase";
import { readStatsCache, writeStatsCache } from "~/server/utils/cache";
import { validateScope } from "~/server/utils/validation";

type DigitRow = { position: number };

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const scope = validateScope((query.scope as string) ?? "5y");
	const pos = query.pos ? Number(query.pos) : undefined;

	if (pos !== undefined && (pos < 1 || pos > 6)) {
		throw createError({ statusCode: 400, message: "Invalid position. Must be 1-6" });
	}

	const db = getSupabaseAdmin();

	const cached = await readStatsCache<DigitRow[]>(db, "digits_all", scope);
	if (cached) {
		const result = pos ? cached.data.filter((d) => d.position === pos) : cached.data;
		return { data: result, cached_at: cached.computedAt };
	}

	const { data: rows, error } = await db.rpc("get_digit_stats", { p_scope: scope });
	if (error) throw createError({ statusCode: 500, message: error.message });

	await writeStatsCache(db, "digits_all", scope, rows);

	const result = pos ? (rows ?? []).filter((d) => d.position === pos) : rows;
	return { data: result ?? [], cached_at: new Date().toISOString() };
});
