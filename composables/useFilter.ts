import type { FilterState, Scope, DrawDay } from "~/types";

const filter = reactive<FilterState>({
	scope: "3y",
	month: null,
	day: "all",
});

export function useFilter() {
	function setScope(scope: Scope) {
		filter.scope = scope;
	}

	function setMonth(month: number | null) {
		filter.month = month;
	}

	function setDay(day: DrawDay) {
		filter.day = day;
	}

	const scopeLabel = computed(() => {
		const map: Record<Scope, string> = {
			"1y": "1 ปี",
			"3y": "3 ปี",
			"5y": "5 ปี",
			"10y": "10 ปี",
			all: "ทั้งหมด",
		};
		return map[filter.scope];
	});

	const queryParams = computed(() => ({
		scope: filter.scope,
		...(filter.month ? { month: filter.month } : {}),
		...(filter.day !== "all" ? { day: filter.day } : {}),
	}));

	return { filter: readonly(filter), setScope, setMonth, setDay, scopeLabel, queryParams };
}
