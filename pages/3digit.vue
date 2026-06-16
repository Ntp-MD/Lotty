<script setup lang="ts">
import type { StatsResponse, RankingItem } from "~/types";
import { useLanguage } from "~/composables/useLanguage";
import { ref, computed, watch } from "vue";

useHead({ title: "3 Digit — Lotty" });

const { filter, queryParams } = useFilter();
const { t } = useLanguage();
const searchQuery = ref("");
const debouncedSearch = ref("");
const prizeType = ref("last3b");
const currentPage = ref(1);
const itemsPerPage = 100;

// Hoist data ref first (before any awaits)
const rawData = ref<StatsResponse | null>(null);

// Hoist ALL computed before any await
const ranking = computed<RankingItem[]>(() => rawData.value?.data.ranking ?? []);
const top10 = computed(() => [...ranking.value].sort((a, b) => b.count - a.count).slice(0, 10));

const filtered = computed(() => {
  const q = debouncedSearch.value.trim();
  if (!q) return ranking.value;
  return ranking.value.filter((r) => r.number.startsWith(q));
});

const sorted = computed(() => [...filtered.value].sort((a, b) => b.count - a.count));
const displayedItems = computed(() => sorted.value.slice(0, currentPage.value * itemsPerPage));
const hasMore = computed(() => sorted.value.length > currentPage.value * itemsPerPage);

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

// Move watch and helpers before the await
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, (newVal) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedSearch.value = newVal;
    currentPage.value = 1;
  }, 300);
});

function loadMore() {
  currentPage.value++;
}

// Computed async key (declared before await)
const asyncKey = computed(() => `3digit-${filter.value.scope}-${prizeType.value}-${filter.value.month ?? ""}-${filter.value.day}`);

// Single await at the bottom of setup
const { data, pending, error, refresh } = await useAsyncData(
  asyncKey.value,
  () => $fetch<StatsResponse>("/api/stats/3digit", { query: { ...queryParams.value, type: prizeType.value } }),
  { watch: [asyncKey] }
);

// Populate hoisted ref
rawData.value = data.value;

watch(data, (newVal) => {
  if (newVal) rawData.value = newVal;
});
</script>

<template>
  <div class="page-content">
    <FilterBar />

    <LoadingSkeleton v-if="pending" variant="podium" :rows="10" />
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
      </div>

      <h1 class="section-title">{{ t('breakdown.table') }}</h1>
      <div class="card">
        <div class="search-wrap">
          <input
            v-model="searchQuery"
            class="search-input focus-ring"
            type="text"
            :placeholder="t('search.placeholder')"
            maxlength="3"
            :aria-label="t('search.aria')"
          />
        </div>
        <EmptyState v-if="!sorted.length" reason="no_search_result" />
        <div v-else class="table-container">
          <table class="freq-table" aria-label="Frequency table for 3 digit numbers">
            <thead>
              <tr>
                <th>{{ t('table.number') }}</th>
                <th>{{ t('table.count') }}</th>
                <th>{{ t('table.lastDraw') }}</th>
                <th>{{ t('table.gap') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in displayedItems"
                :key="item.number"
                :class="{ 'row-hot': item.label === 'Frequent', 'row-cold': item.label === 'Never' }"
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
          {{ t('table.loadMore', { current: displayedItems.length, total: sorted.length }) }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.podium-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gap-sm);
  flex: 1;
}

.search-wrap {
  margin: var(--gap-sm) 0;
}

.search-input {
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

.row-hot td:first-child {
  color: var(--accent-danger);
}

.row-cold td:first-child {
  color: var(--accent-green);
}

/* ── Responsive Breakpoints (Mobile-First) ── */
@media (min-width: 480px) {
  .freq-table th,
  .freq-table td {
    padding: var(--gap-xs) var(--gap-sm);
  }
}

@media (min-width: 768px) {
  .podium-list {
    grid-template-columns: repeat(2, 1fr);
  }
  .breakdown-row > * {
    flex: 1 1 calc(33.333% - var(--gap-md));
  }
}
</style>
