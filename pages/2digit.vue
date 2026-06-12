<script setup lang="ts">
import type { StatsResponse, RankingItem } from "~/types";
import { useLanguage } from "~/composables/useLanguage";

useHead({ title: "2 Digit — Lotty" });

const { filter, queryParams } = useFilter();
const { t } = useLanguage();
const selected = ref<string | null>(null);
const prizeType = ref("last2");

const asyncKey = computed(() => `2digit-${filter.scope}-${prizeType.value}-${filter.month ?? ""}-${filter.day}`);

const { data, pending, error, refresh } = await useAsyncData(
  asyncKey,
  () => $fetch<StatsResponse>("/api/stats/2digit", { query: { ...queryParams.value, type: prizeType.value } }),
  { watch: [asyncKey] },
);

const ranking = computed<RankingItem[]>(() => data.value?.data.ranking ?? []);
const top10 = computed(() => [...ranking.value].sort((a, b) => b.count - a.count).slice(0, 10));

const tensByDigit = computed(() => {
  const freq: Record<string, number> = {};
  ranking.value.forEach((r) => {
    const d = r.number[0];
    freq[d] = (freq[d] ?? 0) + r.count;
  });
  return freq;
});

const tensHotDigit = computed(() => Object.entries(tensByDigit.value).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '0');
const tensColdDigit = computed(() => Object.entries(tensByDigit.value).sort((a, b) => a[1] - b[1])[0]?.[0] ?? '0');

const unitsByDigit = computed(() => {
  const freq: Record<string, number> = {};
  ranking.value.forEach((r) => {
    const d = r.number[1];
    freq[d] = (freq[d] ?? 0) + r.count;
  });
  return freq;
});

const unitsHotDigit = computed(() => Object.entries(unitsByDigit.value).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '0');
const unitsColdDigit = computed(() => Object.entries(unitsByDigit.value).sort((a, b) => a[1] - b[1])[0]?.[0] ?? '0');
</script>

<template>
  <div class="page-content">
    <FilterBar />

    <LoadingSkeleton v-if="pending" variant="heatmap" />
    <ErrorCard v-else-if="error" message="โหลดข้อมูลไม่สำเร็จ" :on-retry="refresh" />
    <EmptyState v-else-if="!ranking.length" reason="no_data_in_range" :scope="filter.scope" />
    <template v-else>

      <div class="card-group">
        <div class="card-content">
          <h1 class="section-title">{{ t('breakdown.title10') }}</h1>
          <div class="card">
            <div class="podium-list">
              <PodiumCard v-for="(item, i) in top10" :key="item.number" :item="item" :rank="i + 1" />
            </div>
          </div>
        </div>

        <div class="card-content">
          <h1 class="section-title">{{ t('breakdown.digitBreakdown') }}</h1>
          <div class="card">
            <div class="breakdown-row">
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
          </div>
        </div>
      </div>

      <h1 class="section-title">{{ t('breakdown.heatmap') }}</h1>
      <div class="card">
        <HeatmapGrid :data="ranking" :selected="selected" @select="selected = $event" />
      </div>

    </template>
  </div>
</template>

<style scoped>
.podium-list {
  display: flex;
  flex-direction: column;
  flex: 1;
}

@media (min-width: 480px) {
  .breakdown-row > * {
    flex: 1 1 calc(50% - var(--gap-md));
  }
}
</style>
