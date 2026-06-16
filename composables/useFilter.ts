import type { FilterState, Scope, DrawDay } from "~/types";

export function useFilter() {
	const filter = useState<FilterState>("filter", () => ({
		scope: "3y",
		month: null,
		day: "all",
	}));

	function setScope(scope: Scope) {
		filter.value.scope = scope;
	}

	function setMonth(month: number | null) {
		filter.value.month = month;
	}

	function setDay(day: DrawDay) {
		filter.value.day = day;
	}

	const scopeLabel = computed(() => {
		const map: Record<Scope, string> = {
			"1y": "1 Year",
			"3y": "3 Years",
			"5y": "5 Years",
			"10y": "10 Years",
			all: "All",
		};
		return map[filter.value.scope];
	});

	const queryParams = computed(() => ({
		scope: filter.value.scope,
		...(filter.value.month ? { month: filter.value.month } : {}),
		...(filter.value.day !== "all" ? { day: filter.value.day } : {}),
	}));

	return { filter: readonly(filter), setScope, setMonth, setDay, scopeLabel, queryParams };
}
