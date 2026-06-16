<script setup lang="ts">
import type { StatsResponse, RankingItem, DigitsResponse, DigitPosition } from "~/types";
import { useLanguage } from "~/composables/useLanguage";
import { ref, computed, watch } from "vue";

useHead({ title: "Stat Bar — Lotty" });

const { filter, queryParams } = useFilter();
const { t } = useLanguage();

// Hoist data ref first (before any awaits)
const statBarData = ref<{ data2digit: StatsResponse; data3digit: StatsResponse; digitsData: DigitsResponse } | null>(null);

// Hoist ALL computed properties first (before any awaits)
const data2digit = computed(() => statBarData.value?.data2digit);
const data3digit = computed(() => statBarData.value?.data3digit);
const digitsData = computed(() => statBarData.value?.digitsData);

const ranking2digit = computed<RankingItem[]>(() => data2digit.value?.data.ranking ?? []);

const tensByDigit = computed(() => {
  const freq: Record<string, number> = {};
  ranking2digit.value.forEach((r) => {
    const d = r.number[0];
    freq[d] = (freq[d] ?? 0) + r.count;
  });
  return freq;
});

const tensHotDigit = computed(() => Object.entries(tensByDigit.value).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '0');
const tensColdDigit = computed(() => Object.entries(tensByDigit.value).sort((a, b) => a[1] - b[1])[0]?.[0] ?? '0');

const unitsByDigit = computed(() => {
  const freq: Record<string, number> = {};
  ranking2digit.value.forEach((r) => {
    const d = r.number[1];
    freq[d] = (freq[d] ?? 0) + r.count;
  });
  return freq;
});

const unitsHotDigit = computed(() => Object.entries(unitsByDigit.value).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '0');
const unitsColdDigit = computed(() => Object.entries(unitsByDigit.value).sort((a, b) => a[1] - b[1])[0]?.[0] ?? '0');

const ranking3digit = computed<RankingItem[]>(() => data3digit.value?.data.ranking ?? []);

const posFreq0 = computed(() => {
  const freq: Record<string, number> = {};
  ranking3digit.value.forEach((r) => {
    const d = r.number[0];
    freq[d] = (freq[d] ?? 0) + r.count;
  });
  return freq;
});

const posFreq1 = computed(() => {
  const freq: Record<string, number> = {};
  ranking3digit.value.forEach((r) => {
    const d = r.number[1];
    freq[d] = (freq[d] ?? 0) + r.count;
  });
  return freq;
});

const posFreq2 = computed(() => {
  const freq: Record<string, number> = {};
  ranking3digit.value.forEach((r) => {
    const d = r.number[2];
    freq[d] = (freq[d] ?? 0) + r.count;
  });
  return freq;
});

const pos0HotDigit = computed(() => Object.entries(posFreq0.value).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '0');
const pos0ColdDigit = computed(() => Object.entries(posFreq0.value).sort((a, b) => a[1] - b[1])[0]?.[0] ?? '0');

const pos1HotDigit = computed(() => Object.entries(posFreq1.value).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '0');
const pos1ColdDigit = computed(() => Object.entries(posFreq1.value).sort((a, b) => a[1] - b[1])[0]?.[0] ?? '0');

const pos2HotDigit = computed(() => Object.entries(posFreq2.value).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '0');
const pos2ColdDigit = computed(() => Object.entries(posFreq2.value).sort((a, b) => a[1] - b[1])[0]?.[0] ?? '0');

const positions = computed(() => {
  const data = digitsData.value?.data;
  if (!data || !Array.isArray(data)) return [];
  return data as Array<{ position: number; freq: Record<string, number>; hot_digit: string; cold_digit: string }>;
});

// Run async fetch last (top-level await at the very bottom of setup)
const asyncKeyStatBar = computed(() => `statbar-${filter.value.scope}-${filter.value.month ?? ""}-${filter.value.day}`);
const { data, pending, error, refresh } = await useAsyncData(
  asyncKeyStatBar.value,
  async () => {
    const [d2, d3, d6] = await Promise.all([
      $fetch<StatsResponse>("/api/stats/2digit", { query: { ...queryParams.value, type: "last2" } }),
      $fetch<StatsResponse>("/api/stats/3digit", { query: { ...queryParams.value, type: "last3b" } }),
      $fetch<DigitsResponse>("/api/stats/digits", { query: { ...queryParams.value } }),
    ]);
    return { data2digit: d2, data3digit: d3, digitsData: d6 };
  },
  { watch: [asyncKeyStatBar] }
);

// Populate our hoisted ref
statBarData.value = data.value;

watch(data, (newVal) => {
  if (newVal) {
    statBarData.value = newVal;
  }
});

const pending2digit = pending;
const pending3digit = pending;
const digitsPending = pending;

const error2digit = error;
const error3digit = error;
const digitsError = error;

const refresh2digit = refresh;
const refresh3digit = refresh;
const refreshDigits = refresh;
</script>

<template>
  <div class="stat-bar">
    <FilterBar />

    <!-- 2-digit Section -->
    <h1 class="stat-bar__title">{{ t('breakdown.title2d') }}</h1>
    <LoadingSkeleton v-if="pending2digit" variant="chart" />
    <ErrorCard v-else-if="error2digit" message="โหลดข้อมูลไม่สำเร็จ" :on-retry="refresh2digit" />
    <EmptyState v-else-if="!ranking2digit.length" reason="no_data_in_range" :scope="filter.scope" />
    <div v-else class="stat-bar__row">
      <DigitBarChart
        :position="1"
        :freq="tensByDigit"
        :hot_digit="tensHotDigit"
        :cold_digit="tensColdDigit"
      />
      <DigitBarChart
        :position="2"
        :freq="unitsByDigit"
        :hot_digit="unitsHotDigit"
        :cold_digit="unitsColdDigit"
      />
    </div>

    <!-- 3-digit Section -->
    <h1 class="stat-bar__title">{{ t('breakdown.title3d') }}</h1>
    <LoadingSkeleton v-if="pending3digit" variant="chart" />
    <ErrorCard v-else-if="error3digit" message="โหลดข้อมูลไม่สำเร็จ" :on-retry="refresh3digit" />
    <EmptyState v-else-if="!ranking3digit.length" reason="no_data_in_range" :scope="filter.scope" />
    <div v-else class="stat-bar__row">
      <DigitBarChart
        :position="1"
        :freq="posFreq0"
        :hot_digit="pos0HotDigit"
        :cold_digit="pos0ColdDigit"
      />
      <DigitBarChart
        :position="2"
        :freq="posFreq1"
        :hot_digit="pos1HotDigit"
        :cold_digit="pos1ColdDigit"
      />
      <DigitBarChart
        :position="3"
        :freq="posFreq2"
        :hot_digit="pos2HotDigit"
        :cold_digit="pos2ColdDigit"
      />
    </div>

    <!-- 6-digit Section -->
    <h1 class="stat-bar__title">{{ t('breakdown.title6d') }}</h1>
    <LoadingSkeleton v-if="digitsPending" variant="chart" />
    <ErrorCard v-else-if="digitsError" message="โหลดข้อมูลไม่สำเร็จ" :on-retry="refreshDigits" />
    <EmptyState v-else-if="!positions.length" reason="no_data_in_range" :scope="filter.scope" />
    <div v-else class="stat-bar__grid">
        <DigitBarChart
          v-for="pos in positions"
          :key="pos.position"
          :position="pos.position as 1 | 2 | 3 | 4 | 5 | 6"
          :freq="pos.freq"
          :hot_digit="pos.hot_digit"
          :cold_digit="pos.cold_digit"
        />
    </div>
  </div>
</template>

<style scoped>
.stat-bar {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
  height: 100%;
  min-height: 0;
}

.stat-bar__title {
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  text-transform: none;
  letter-spacing: -0.5px;
  margin-bottom: var(--gap-xs);
}

.stat-bar__row {
  display: flex;
  gap: var(--gap-md);
  flex-wrap: wrap;
  flex: 1;
}

.stat-bar__row > * {
  flex: 1 1 100%;
  min-width: 0;
}

.stat-bar__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gap-sm);
  flex: 1;
}

/* ── Responsive Breakpoints (Mobile-First) ── */
@media (min-width: 768px) {
  .stat-bar__row > * {
    flex: 1 1 calc(50% - var(--gap-md));
  }

  .stat-bar__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .stat-bar__grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>
