export const NEVER_GAP = 999;

const GAP_HOT_MIN = 10;
const GAP_WARM_MIN = 5;

export type GapClass = "gap-hot" | "gap-warm" | "gap-normal";

export function getGapClass(gap: number): GapClass {
	if (gap >= GAP_HOT_MIN) return "gap-hot";
	if (gap >= GAP_WARM_MIN) return "gap-warm";
	return "gap-normal";
}

export function formatGapLabel(gap: number, draws: string, never: string): string {
	return gap === NEVER_GAP ? never : `${gap} ${draws}`;
}
