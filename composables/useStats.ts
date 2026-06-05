import type { StatsResponse, DigitsResponse, LookupResponse, AdvisorResponse } from "~/types";

export function useStats() {
  const { queryParams, filter } = useFilter();

  async function fetch2Digit() {
    return await $fetch<StatsResponse>("/api/stats/2digit", { query: { ...queryParams.value, type: filter.prizeType } });
  }

  async function fetch3Digit() {
    return await $fetch<StatsResponse>("/api/stats/3digit", { query: { ...queryParams.value, type: filter.prizeType } });
  }

  async function fetchDigits() {
    return await $fetch<DigitsResponse>("/api/stats/digits", { query: { scope: filter.scope } });
  }

  async function fetchLookup(number: string) {
    return await $fetch<LookupResponse>("/api/stats/lookup", { query: { number, scope: filter.scope } });
  }

  async function fetchAdvisor() {
    return await $fetch<AdvisorResponse>("/api/advisor", { query: { scope: filter.scope } });
  }

  return { fetch2Digit, fetch3Digit, fetchDigits, fetchLookup, fetchAdvisor };
}
