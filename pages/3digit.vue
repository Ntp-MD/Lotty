<script setup lang="ts">
import type { StatsResponse, RankingItem } from "~/types";

useHead({ title: "3 ตัว — LottoLens" });

const { filter, queryParams } = useFilter();
const searchQuery = ref("");

const asyncKey = computed(() => `3digit-${filter.scope}-${filter.prizeType}-${filter.month ?? ""}`);

const { data, pending, error, refresh } = await useAsyncData(
  asyncKey,
  () => $fetch<StatsResponse>("/api/stats/3digit", { query: { ...queryParams.value, type: filter.prizeType } }),
  { watch: [asyncKey] },
);

const ranking = computed<RankingItem[]>(() => data.value?.data.ranking ?? []);

const filtered = computed(() => {
  const q = searchQuery.value.trim();
  if (!q) return ranking.value;
  return ranking.value.filter((r) => r.number.startsWith(q));
});

const sorted = computed(() => [...filtered.value].sort((a, b) => b.count - a.count));

function posFreq(pos: 0 | 1 | 2) {
  const freq: Record<string, number> = {};
  ranking.value.forEach((r) => {
    const d = r.number[pos];
    freq[d] = (freq[d] ?? 0) + r.count;
  });
  return freq;
}
</script>

<template>
  <div>
    <FilterBar />
    <h1 class="section-title" style="margin-top: var(--gap-md)">สถิติ 3 ตัว</h1>

    <LoadingSkeleton v-if="pending" variant="podium" :rows="10" />
    <ErrorCard v-else-if="error" message="โหลดข้อมูลไม่สำเร็จ" :on-retry="refresh" />
    <EmptyState v-else-if="!ranking.length" reason="no_data_in_range" :scope="filter.scope" />
    <template v-else>
      <section class="section-block">
        <h2 class="section-title">Pattern Insight — แยกหลัก</h2>
        <div class="breakdown-row">
          <DigitBarChart
            :position="1"
            :freq="posFreq(0)"
            :hot_digit="Object.entries(posFreq(0)).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '0'"
            :cold_digit="Object.entries(posFreq(0)).sort((a, b) => a[1] - b[1])[0]?.[0] ?? '0'"
          />
          <DigitBarChart
            :position="2"
            :freq="posFreq(1)"
            :hot_digit="Object.entries(posFreq(1)).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '0'"
            :cold_digit="Object.entries(posFreq(1)).sort((a, b) => a[1] - b[1])[0]?.[0] ?? '0'"
          />
          <DigitBarChart
            :position="3"
            :freq="posFreq(2)"
            :hot_digit="Object.entries(posFreq(2)).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '0'"
            :cold_digit="Object.entries(posFreq(2)).sort((a, b) => a[1] - b[1])[0]?.[0] ?? '0'"
          />
        </div>
      </section>

      <section class="section-block">
        <h2 class="section-title">ตารางความถี่</h2>
        <div class="search-wrap">
          <input
            v-model="searchQuery"
            class="search-input focus-ring"
            type="text"
            placeholder="ค้นหาเลข เช่น 123"
            maxlength="3"
            aria-label="ค้นหาเลข 3 ตัว"
          />
        </div>
        <EmptyState v-if="!sorted.length" reason="no_search_result" />
        <table v-else class="freq-table" aria-label="ตารางความถี่เลข 3 ตัว">
          <thead>
            <tr>
              <th>เลข</th>
              <th>ครั้ง</th>
              <th>ครั้งล่าสุด</th>
              <th>ห่างงวด</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in sorted.slice(0, 100)"
              :key="item.number"
              :class="{ 'row-hot': item.label === 'ออกบ่อย', 'row-cold': item.label === 'ไม่เคยออก' }"
            >
              <td class="num-display" style="font-size: var(--text-md)">{{ item.number }}</td>
              <td class="num-mono">{{ item.count }}</td>
              <td class="num-mono">{{ item.last_draw || "—" }}</td>
              <td class="num-mono">{{ item.gap }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>

    <DisclaimerBanner />
  </div>
</template>

<style scoped>
.section-block {
  margin-top: var(--gap-lg);
}
.breakdown-row {
  display: flex;
  gap: var(--gap-md);
  flex-wrap: wrap;
  margin-top: var(--gap-sm);
}
.breakdown-row > * {
  flex: 1;
  min-width: 140px;
}
.search-wrap {
  margin: var(--gap-sm) 0;
}
.search-input {
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  padding: var(--gap-xs) var(--gap-sm);
  font-family: var(--font-mono);
  font-size: var(--text-md);
  width: 160px;
}
.freq-table {
  border-spacing: 0;
}
.freq-table th {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  text-align: left;
  padding: var(--gap-xs) var(--gap-sm);
  border-bottom: 1px solid var(--border);
}
.freq-table td {
  font-size: var(--text-sm);
  padding: var(--gap-xs) var(--gap-sm);
  border-bottom: 1px solid var(--border);
}
.row-hot td:first-child {
  color: var(--accent-gold);
}
.row-cold td:first-child {
  color: var(--accent-green);
}
</style>
