import type { RankingItem, NumberLabel } from "~/types";

export const HOT_PERCENTILE = 90;
export const COLD_PERCENTILE = 10;

export function computePercentile(values: number[], p: number): number {
	if (!values.length) return 0;
	const sorted = [...values].sort((a, b) => a - b);
	// Nearest-rank method: N = ceil(p/100 * len), then 0-indexed = N - 1
	const idx = Math.min(Math.ceil((p / 100) * sorted.length) - 1, sorted.length - 1);
	return sorted[Math.max(idx, 0)];
}

/**
 * Build hot/cold thresholds from numbers that have ACTUALLY appeared at least
 * once. The RPCs LEFT JOIN against `generate_series(0..99)` / `0..999`, so the
 * raw ranking includes hundreds of zero-count rows. Feeding those zeros into
 * the percentile calculation drags both thresholds toward 0 and mislabels
 * everything as "Frequent" or "Never".
 */
export function thresholdsFromCounts(counts: number[]): { hot: number; cold: number } {
	const observed = counts.filter((c) => c > 0);
	if (!observed.length) return { hot: 0, cold: 0 };
	return {
		hot: computePercentile(observed, HOT_PERCENTILE),
		cold: computePercentile(observed, COLD_PERCENTILE),
	};
}

export function assignLabels(
	items: Array<{ number: string; count: number; last_draw: string | null; gap: number; pct: number }>,
): RankingItem[] {
	const { hot, cold } = thresholdsFromCounts(items.map((i) => i.count));
	return items.map((i) => ({
		number: i.number,
		count: i.count,
		last_draw: i.last_draw ?? "",
		gap: i.gap,
		pct: i.pct,
		// A number that has never appeared in scope is always "Never" regardless
		// of how the percentile lands; otherwise compare against the observed
		// distribution.
		label: (i.count === 0
			? "Never"
			: i.count >= hot
				? "Frequent"
				: i.count <= cold
					? "Never"
					: "Normal") as NumberLabel,
	}));
}

export function scopeToYears(scope: string): number | null {
	const map: Record<string, number | null> = {
		"1y": 1,
		"3y": 3,
		"5y": 5,
		"10y": 10,
		all: null,
	};
	return map[scope] ?? 5;
}

const DRAW_ANNOUNCE_HOUR = 16;
const THAI_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Current Thai (UTC+7) wall-clock components, computed without relying on
 * runtime ICU/timezone data (which is missing on some serverless platforms).
 */
function thaiNow(): { year: number; month: number; day: number; hour: number } {
	const dt = new Date(Date.now() + THAI_OFFSET_MS);
	return {
		year: dt.getUTCFullYear(),
		month: dt.getUTCMonth(),
		day: dt.getUTCDate(),
		hour: dt.getUTCHours(),
	};
}

/**
 * Build a YYYY-MM-DD string from explicit components, normalising out-of-range
 * month values (e.g. month=-1 -> December previous year) via UTC construction.
 */
function ymd(year: number, month: number, day: number): string {
	const d = new Date(Date.UTC(year, month, day));
	const y = d.getUTCFullYear();
	const m = String(d.getUTCMonth() + 1).padStart(2, "0");
	const dd = String(d.getUTCDate()).padStart(2, "0");
	return `${y}-${m}-${dd}`;
}

/**
 * The most recent draw date (1st or 16th, Thai time) that should already have
 * been announced as of now. Used to detect when the stored latest draw is stale.
 */
export function lastExpectedDrawDate(): string {
	const { year, month, day, hour } = thaiNow();
	const announced = (drawDay: number) => day > drawDay || (day === drawDay && hour >= DRAW_ANNOUNCE_HOUR);

	if (announced(16)) return ymd(year, month, 16);
	if (announced(1)) return ymd(year, month, 1);
	return ymd(year, month - 1, 16);
}

export function nextDrawDate(): string {
	const { year, month, day, hour } = thaiNow();
	if (day < 16 || (day === 16 && hour < 16)) return ymd(year, month, 16);
	return ymd(year, month + 1, 1);
}
