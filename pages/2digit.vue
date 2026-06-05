<script setup lang="ts">
import type { StatsResponse, RankingItem } from "~/types";

useHead({ title: "2 ตัว — LottoLens" });

const { filter, queryParams } = useFilter();
const selected = ref<string | null>(null);

const asyncKey = computed(() => `2digit-${filter.scope}-${filter.prizeType}-${filter.month ?? ""}-${filter.day}`);

const { data, pending, error, refresh } = await useAsyncData(
  asyncKey,
  () => $fetch<StatsResponse>("/api/stats/2digit", { query: { ...queryParams.value, type: filter.prizeType } }),
  { watch: [asyncKey] },
);

const ranking = computed<RankingItem[]>(() => data.value?.data.ranking ?? []);
const top10 = computed(() => [...ranking.value].sort((a, b) => b.count - a.count).slice(0, 10));
const bottom10 = computed(() => [...ranking.value].sort((a, b) => a.count - b.count).slice(0, 10));

const tensByDigit = computed(() => {
  const freq: Record<string, number> = {};
  ranking.value.forEach((r) => {
    const d = r.number[0];
    freq[d] = (freq[d] ?? 0) + r.count;
  });
  return freq;
});

const unitsByDigit = computed(() => {
  const freq: Record<string, number> = {};
  ranking.value.forEach((r) => {
    const d = r.number[1];
    freq[d] = (freq[d] ?? 0) + r.count;
  });
  return freq;
});
</script>

<template>
  <div>
    <FilterBar />

    <h1 class="section-title" style="margin-top: var(--gap-md)">สถิติ 2 ตัว</h1>

    <LoadingSkeleton v-if="pending" variant="heatmap" />
    <ErrorCard v-else-if="error" message="โหลดข้อมูลไม่สำเร็จ" :on-retry="refresh" />
    <EmptyState v-else-if="!ranking.length" reason="no_data_in_range" :scope="filter.scope" />
    <template v-else>
      <section class="section-block">
        <h2 class="section-title">Heatmap ความถี่</h2>
        <HeatmapGrid :data="ranking" :selected="selected" @select="selected = $event" />
      </section>

      <section class="section-block page-grid page-grid-2">
        <div>
          <h2 class="section-title">🔥 บ่อยสุด 10 อันดับ</h2>
          <div class="podium-list">
            <PodiumCard v-for="(item, i) in top10" :key="item.number" :item="item" :rank="i + 1" />
          </div>
        </div>
        <div>
          <h2 class="section-title">🧊 น้อยสุด 10 อันดับ</h2>
          <div class="podium-list">
            <PodiumCard v-for="(item, i) in bottom10" :key="item.number" :item="item" :rank="i + 1" />
          </div>
        </div>
      </section>

      <section class="section-block">
        <h2 class="section-title">Breakdown แยกหลัก</h2>
        <div class="breakdown-row">
          <DigitBarChart
            :position="1"
            :freq="tensByDigit"
            :hot_digit="Object.entries(tensByDigit).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '0'"
            :cold_digit="Object.entries(tensByDigit).sort((a, b) => a[1] - b[1])[0]?.[0] ?? '0'"
          />
          <DigitBarChart
            :position="2"
            :freq="unitsByDigit"
            :hot_digit="Object.entries(unitsByDigit).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '0'"
            :cold_digit="Object.entries(unitsByDigit).sort((a, b) => a[1] - b[1])[0]?.[0] ?? '0'"
          />
        </div>
      </section>
    </template>

    <DisclaimerBanner />
  </div>
</template>

<style scoped>
.section-block {
  margin-top: var(--gap-lg);
}
.podium-list {
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm);
  margin-top: var(--gap-sm);
}
.breakdown-row {
  display: flex;
  gap: var(--gap-md);
  margin-top: var(--gap-sm);
  flex-wrap: wrap;
}
.breakdown-row > * {
  flex: 1;
  min-width: 160px;
}
</style>
