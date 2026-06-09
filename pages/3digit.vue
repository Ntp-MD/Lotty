<script setup lang="ts">
import type { StatsResponse, RankingItem } from "~/types";

useHead({ title: "3 ตัว — Lotty" });

const { filter, queryParams } = useFilter();
const searchQuery = ref("");
const debouncedSearch = ref("");
const prizeType = ref("last3b");
const currentPage = ref(1);
const itemsPerPage = 100;

const asyncKey = computed(() => `3digit-${filter.scope}-${prizeType.value}-${filter.month ?? ""}-${filter.day}`);

const { data, pending, error, refresh } = await useAsyncData(
  asyncKey,
  () => $fetch<StatsResponse>("/api/stats/3digit", { query: { ...queryParams.value, type: prizeType.value } }),
  { watch: [asyncKey] },
);

const ranking = computed<RankingItem[]>(() => data.value?.data.ranking ?? []);
const top10 = computed(() => [...ranking.value].sort((a, b) => b.count - a.count).slice(0, 10));

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(searchQuery, (newVal) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedSearch.value = newVal;
    currentPage.value = 1;
  }, 300);
});

const filtered = computed(() => {
  const q = debouncedSearch.value.trim();
  if (!q) return ranking.value;
  return ranking.value.filter((r) => r.number.startsWith(q));
});

const sorted = computed(() => [...filtered.value].sort((a, b) => b.count - a.count));
const displayedItems = computed(() => sorted.value.slice(0, currentPage.value * itemsPerPage));
const hasMore = computed(() => sorted.value.length > currentPage.value * itemsPerPage);

function loadMore() {
  currentPage.value++;
}

const posFreq0 = computed(() => {
  const freq: Record<string, number> = {};
  ranking.value.forEach((r) => {
    const d = r.number[0];
    freq[d] = (freq[d] ?? 0) + r.count;
  });
  return freq;
});

const posFreq1 = computed(() => {
  const freq: Record<string, number> = {};
  ranking.value.forEach((r) => {
    const d = r.number[1];
    freq[d] = (freq[d] ?? 0) + r.count;
  });
  return freq;
});

const posFreq2 = computed(() => {
  const freq: Record<string, number> = {};
  ranking.value.forEach((r) => {
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
</script>

<template>
  <div class="page-container page-content">
    <FilterBar />
    <h1 class="section-title">สถิติ 3 ตัว</h1>

    <LoadingSkeleton v-if="pending" variant="podium" :rows="10" />
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
        <div v-else class="table-container">
          <table class="freq-table" aria-label="ตารางความถี่เลข 3 ตัว">
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
                v-for="item in displayedItems"
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
        </div>
        <button
          v-if="hasMore"
          @click="loadMore"
          class="btn btn-ghost btn-sm"
          style="width: 100%"
        >
          โหลดเพิ่ม (แสดง {{ displayedItems.length }} / {{ sorted.length }})
        </button>
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

@media (min-width: 768px) {
  .breakdown-row > * {
    flex: 1 1 calc(33.333% - var(--gap-md));
  }
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
  width: 100%;
  max-width: 200px;
}
.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.freq-table {
  border-spacing: 0;
  width: 100%;
}
.freq-table th {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  text-align: left;
  padding: 6px 8px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.freq-table td {
  font-size: var(--text-sm);
  padding: 6px 8px;
  border-bottom: 1px solid var(--border);
  text-align: left;
}

@media (min-width: 480px) {
  .freq-table th,
  .freq-table td {
    padding: var(--gap-xs) var(--gap-sm);
  }
}
.row-hot td:first-child {
  color: var(--accent-danger);
}
.row-cold td:first-child {
  color: var(--accent-green);
}
</style>
