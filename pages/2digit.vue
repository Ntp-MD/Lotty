<script setup lang="ts">
import type { StatsResponse, RankingItem } from "~/types";

useHead({ title: "2 ตัว — Lotty" });

const { filter, queryParams } = useFilter();
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
  <div class="page-container page-content">
    <FilterBar />

    <h1 class="section-title">สถิติ 2 ตัว</h1>

    <LoadingSkeleton v-if="pending" variant="heatmap" />
    <ErrorCard v-else-if="error" message="โหลดข้อมูลไม่สำเร็จ" :on-retry="refresh" />
    <EmptyState v-else-if="!ranking.length" reason="no_data_in_range" :scope="filter.scope" />
    <template v-else>
      <section class="section-block page-grid page-grid-2">
        <div>
          <h2 class="section-title">ออกบ่อย 10 อันดับ</h2>
          <div class="podium-list">
            <PodiumCard v-for="(item, i) in top10" :key="item.number" :item="item" :rank="i + 1" />
          </div>
        </div>
        <div class="breakdown-container">
          <h2 class="section-title">Breakdown แยกหลัก</h2>
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
      </section>

      <section class="section-block">
        <h2 class="section-title">Heatmap ความถี่</h2>
        <HeatmapGrid :data="ranking" :selected="selected" @select="selected = $event" />
      </section>
    </template>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.page-content {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
}
.section-block {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
}
.podium-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gap-sm);
}

@media (min-width: 768px) {
  .podium-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
.breakdown-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.breakdown-row {
  display: flex;
  gap: var(--gap-md);
  flex-wrap: wrap;
  flex: 1;
}
.breakdown-row > * {
  flex: 1 1 100%;
  min-width: 0;
}

@media (min-width: 480px) {
  .breakdown-row > * {
    flex: 1 1 calc(50% - var(--gap-md));
  }
}
</style>
