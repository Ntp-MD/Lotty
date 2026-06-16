import type { RankingItem, NumberLabel } from "~/types";

export const HOT_PERCENTILE = 90;
export const COLD_PERCENTILE = 10;

export function computePercentile(values: number[], p: number): number {
	if (!values.length) return 0;
	const sorted = [...values].sort((a, b) => a - b);
	const idx = Math.floor((p / 100) * sorted.length);
	return sorted[Math.min(idx, sorted.length - 1)];
}

export function assignLabels(
	items: Array<{ number: string; count: number; last_draw: string | null; gap: number; pct: number }>,
): RankingItem[] {
	const counts = items.map((i) => i.count);
	const hotThreshold = computePercentile(counts, HOT_PERCENTILE);
	const coldThreshold = computePercentile(counts, COLD_PERCENTILE);
	return items.map((i) => ({
		number: i.number,
		count: i.count,
		last_draw: i.last_draw ?? "",
		gap: i.gap,
		pct: i.pct,
		label: (i.count >= hotThreshold
			? "Frequent"
			: i.count <= coldThreshold
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

export function buildDateFilter(scope: string, month?: number, day?: string): string {
	const parts: string[] = [];
	const years = scopeToYears(scope);
	if (years !== null) {
		const from = new Date();
		from.setFullYear(from.getFullYear() - years);
		parts.push(`draw_date >= '${from.toISOString().slice(0, 10)}'`);
	}
	if (month) {
		parts.push(`EXTRACT(MONTH FROM draw_date) = ${month}`);
	}
	if (day === "1") {
		parts.push(`EXTRACT(DAY FROM draw_date) = 1`);
	} else if (day === "16") {
		parts.push(`EXTRACT(DAY FROM draw_date) = 16`);
	}
	return parts.join(" AND ");
}

const DRAW_ANNOUNCE_HOUR = 16;

function toYmd(dt: Date): string {
	const y = dt.getFullYear();
	const m = String(dt.getMonth() + 1).padStart(2, "0");
	const d = String(dt.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

/**
 * The most recent draw date (1st or 16th, Thai time) that should already have
 * been announced as of now. Used to detect when the stored latest draw is stale.
 */
export function lastExpectedDrawDate(): string {
	const now = new Date();
	const thai = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
	const year = thai.getFullYear();
	const month = thai.getMonth();
	const day = thai.getDate();
	const hour = thai.getHours();

	const announced = (drawDay: number) => day > drawDay || (day === drawDay && hour >= DRAW_ANNOUNCE_HOUR);

	if (announced(16)) return toYmd(new Date(year, month, 16));
	if (announced(1)) return toYmd(new Date(year, month, 1));
	return toYmd(new Date(year, month - 1, 16));
}

export function nextDrawDate(): string {
	const now = new Date();
	const thaiTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
	const year = thaiTime.getFullYear();
	const month = thaiTime.getMonth();
	const day = thaiTime.getDate();
	if (day < 16) return new Date(year, month, 16).toISOString().slice(0, 10);
	return new Date(year, month + 1, 1).toISOString().slice(0, 10);
}
