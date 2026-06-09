export type Scope = "1y" | "3y" | "5y" | "10y" | "all";
export type PrizeType = "last2" | "first2" | "last3b" | "last3f" | "first";
export type NumberLabel = "ออกบ่อย" | "ไม่เคยออก" | "ปกติ";
export type DrawDay = "all" | "1" | "16";

export interface FilterState {
	scope: Scope;
	prizeType?: PrizeType;
	month: number | null;
	day: DrawDay;
}

export interface RankingItem {
	number: string;
	count: number;
	last_draw: string;
	gap: number;
	pct: number;
	label: NumberLabel;
}

export interface StatsResponse {
	data: {
		ranking: RankingItem[];
		total_draws: number;
		hot_threshold: number;
		cold_threshold: number;
	};
	cached_at: string;
}

export interface DigitPosition {
	position: 1 | 2 | 3 | 4 | 5 | 6;
	freq: Record<string, number>;
	hot_digit: string;
	cold_digit: string;
}

export interface DigitsResponse {
	data: DigitPosition[];
	cached_at: string;
}

export interface LookupResult {
	number: string;
	count: number;
	last_draw: string;
	gap: number;
	rank: number;
	total: number;
	label: NumberLabel;
	history: Array<{ draw_date: string }>;
}

export interface LookupResponse {
	data: LookupResult;
	cached_at: string;
}

export interface AdvisorSuggestion {
	number: string;
	gap: number;
	avg_gap: number;
}

export interface AdvisorResponse {
	data: {
		draw_date_next: string;
		suggestions: {
			last2: AdvisorSuggestion;
			last3b: AdvisorSuggestion;
			last3f: AdvisorSuggestion;
		};
		rationale: string;
	};
	cached_at: string;
}

export interface DrawRecord {
	id: number;
	draw_date: string;
	first: string;
	last2: string;
	last3f: string;
	last3b: string;
	second: string[];
	third: string[];
	fourth: string[];
	fifth: string[];
	near1: string[];
	created_at: string;
}

export interface ApiError {
	error: string;
	code: number;
}
