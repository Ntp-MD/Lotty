import { getSupabaseAdmin } from "~/server/utils/supabase";
import { computePercentile } from "~/server/utils/stats";
import { validateScope } from "~/server/utils/validation";
import { validateNumericString, sanitizeNumericInput } from "~/server/utils/validation-helpers";

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const rawNumber = (query.number as string)?.trim();

	if (!rawNumber) {
		throw createError({ statusCode: 400, message: "number parameter is required" });
	}

	const number = sanitizeNumericInput(rawNumber);
	const scope = validateScope((query.scope as string) ?? "5y");

	if (!validateNumericString(number, 2, 3)) {
		throw createError({ statusCode: 400, message: "number must be 2 or 3 digits (numeric only)" });
	}

	const db = getSupabaseAdmin();
	const col = number.length === 2 ? "last2" : "last3b";

	const { data: rows, error } = await db.rpc("get_lookup_stats", {
		p_number: number,
		p_col: col,
		p_scope: scope,
	});

	if (error) throw createError({ statusCode: 500, message: error.message });

	const row = rows?.[0];
	if (!row) return { data: null, cached_at: new Date().toISOString() };

	const is2digit = number.length === 2;
	const { data: allRows } = is2digit
		? await db.rpc("get_2digit_stats", { p_col: col, p_scope: scope, p_month: null, p_day: null })
		: await db.rpc("get_3digit_stats", { p_col: col, p_scope: scope, p_month: null });

	// Rank only against numbers that have ACTUALLY appeared in the period.
	// `allRows` contains every possible 2/3-digit combination (LEFT JOIN with
	// generate_series), so using its length as the denominator inflates rank
	// totals to 100/1000 even when only a handful of numbers were drawn.
	const observedCounts = (allRows ?? []).map((r) => Number(r.count)).filter((c) => c > 0);
	const myCount = Number(row.count);
	// Handle ties: every number tied with `myCount` shares the same rank,
	// equal to (count_of_items_strictly_greater + 1). Numbers that never
	// appeared (count = 0) are placed at the end (rank = observed + 1).
	const rank = myCount > 0
		? observedCounts.filter((c) => c > myCount).length + 1
		: observedCounts.length + 1;

	const hot = computePercentile(observedCounts, 90);
	const cold = computePercentile(observedCounts, 10);
	const label = myCount === 0
		? "Never"
		: myCount >= hot
			? "Frequent"
			: myCount <= cold
				? "Never"
				: "Normal";

	return {
		data: {
			number,
			count: myCount,
			last_draw: row.last_draw,
			gap: row.gap,
			rank,
			total: observedCounts.length,
			label,
			history: row.history ?? [],
		},
		cached_at: new Date().toISOString(),
	};
});
