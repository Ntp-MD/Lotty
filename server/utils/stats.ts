import type { RankingItem, NumberLabel } from "~/types";

export function computePercentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.floor((p / 100) * sorted.length);
  return sorted[Math.min(idx, sorted.length - 1)];
}

export function assignLabels(
  items: Omit<RankingItem, "label">[],
): RankingItem[] {
  const counts = items.map((i) => i.count);
  const hotThreshold = computePercentile(counts, 90);
  const coldThreshold = computePercentile(counts, 10);
  return items.map((i) => ({
    ...i,
    label: (i.count >= hotThreshold
      ? "ออกบ่อย"
      : i.count <= coldThreshold
        ? "ไม่เคยออก"
        : "ปกติ") as NumberLabel,
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

export function nextDrawDate(): string {
  const now = new Date();
  const thaiTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  const year = thaiTime.getFullYear();
  const month = thaiTime.getMonth();
  const day = thaiTime.getDate();
  if (day < 1) return new Date(year, month, 1).toISOString().slice(0, 10);
  if (day < 16) return new Date(year, month, 16).toISOString().slice(0, 10);
  return new Date(year, month + 1, 1).toISOString().slice(0, 10);
}
