export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
	public: {
		Tables: {
			draws: {
				Row: {
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
				};
				Insert: {
					id?: number;
					draw_date: string;
					first: string;
					last2: string;
					last3f: string;
					last3b: string;
					second?: string[];
					third?: string[];
					fourth?: string[];
					fifth?: string[];
					near1?: string[];
					created_at?: string;
				};
				Update: {
					id?: number;
					draw_date?: string;
					first?: string;
					last2?: string;
					last3f?: string;
					last3b?: string;
					second?: string[];
					third?: string[];
					fourth?: string[];
					fifth?: string[];
					near1?: string[];
					created_at?: string;
				};
				Relationships: [];
			};
			stats_cache: {
				Row: {
					id: number;
					stat_type: string;
					scope: string;
					data_json: Json;
					computed_at: string;
				};
				Insert: {
					id?: number;
					stat_type: string;
					scope: string;
					data_json?: Json;
					computed_at?: string;
				};
				Update: {
					id?: number;
					stat_type?: string;
					scope?: string;
					data_json?: Json;
					computed_at?: string;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			get_2digit_stats: {
				Args: {
					p_col: string;
					p_scope: string;
					p_month: number | null;
					p_day: string | null;
				};
				Returns: {
					number: string;
					count: number;
					last_draw: string | null;
					gap: number;
					pct: number;
				}[];
			};
			get_3digit_stats: {
				Args: {
					p_col: string;
					p_scope: string;
					p_month: number | null;
				};
				Returns: {
					number: string;
					count: number;
					last_draw: string | null;
					gap: number;
					pct: number;
				}[];
			};
			get_digit_stats: {
				Args: {
					p_scope: string;
				};
				Returns: {
					position: number;
					freq: Json;
					hot_digit: string;
					cold_digit: string;
				}[];
			};
			get_lookup_stats: {
				Args: {
					p_number: string;
					p_col: string;
					p_scope: string;
				};
				Returns: {
					count: number;
					last_draw: string | null;
					gap: number;
					history: Json;
				}[];
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
}
