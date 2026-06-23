<script setup lang="ts">
import { formatDate } from "~/composables/useDate";
import type { DrawRecord } from "~/types";
import { useLanguage } from "~/composables/useLanguage";

useHead({ title: "Archive — Lotty" });

const { t } = useLanguage();

const page = ref(1);
const perPage = 20;
const filterYear = ref<number | null>(null);
const filterMonth = ref<number | null>(null);
const expanded = ref<number | null>(null);

// Hoist before await — useSupabaseClient needs Nuxt instance
const client = useSupabaseClient();

// Hoist before await
const years = computed(() => {
  const current = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => current - i);
});

const { data, pending, error } = await useAsyncData(
  "archive",
  async () => {
    let query = client.from("draws").select("*").order("draw_date", { ascending: false });
    if (filterYear.value)
      query = query.filter("draw_date", "gte", `${filterYear.value}-01-01`).filter("draw_date", "lte", `${filterYear.value}-12-31`);
    if (filterMonth.value) {
      const y = filterYear.value ?? new Date().getFullYear();
      // Use Date.UTC to compute the half-open [start, nextMonthStart) range so
      // year/month rollover (Dec -> Jan, month 13 -> "13") cannot produce an
      // invalid date string for any future edit.
      const startDate = new Date(Date.UTC(y, filterMonth.value - 1, 1));
      const endDate = new Date(Date.UTC(y, filterMonth.value, 1));
      const iso = (d: Date) => d.toISOString().slice(0, 10);
      query = query
        .filter("draw_date", "gte", iso(startDate))
        .filter("draw_date", "lt", iso(endDate));
    }
    const { data: rows } = await query.range((page.value - 1) * perPage, page.value * perPage - 1);
    return rows as DrawRecord[];
  },
  { watch: [page, filterYear, filterMonth] },
);
</script>

<template>
  <div class="page-content">
    <h1 class="section-title">{{ t('results.historical') }}</h1>

    <div class="card">
      <div class="archive-filters">
        <select
          class="filter-select focus-ring"
          :value="filterYear"
          @change="
            filterYear = ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null;
            page = 1;
          "
        >
          <option value="">{{ t('archive.allYears') }}</option>
          <option v-for="y in years" :key="y" :value="y">{{ y + 543 }}</option>
        </select>
        <select
          class="filter-select focus-ring"
          :value="filterMonth"
          @change="
            filterMonth = ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null;
            page = 1;
          "
        >
          <option value="">{{ t('archive.allMonths') }}</option>
          <option v-for="m in 12" :key="m" :value="m">{{ t('archive.monthName', { m }) }}</option>
        </select>
      </div>
    </div>

    <LoadingSkeleton v-if="pending" variant="podium" :rows="8" />
    <ErrorCard v-else-if="error" message="โหลดข้อมูลไม่สำเร็จ" />
    <EmptyState v-else-if="!data?.length" reason="no_data_in_range" />
    <div v-else class="archive-list">
      <div v-for="draw in data" :key="draw.id" class="archive-item card">
        <button class="archive-header focus-ring" :aria-expanded="expanded === draw.id" @click="expanded = expanded === draw.id ? null : draw.id">
          <span class="archive-date">{{ formatDate(draw.draw_date) }}</span>
          <span class="archive-first num-display">{{ draw.first }}</span>
          <span class="archive-chevron" aria-hidden="true">{{ expanded === draw.id ? "-" : "+" }}</span>
        </button>

        <div v-if="expanded === draw.id" class="archive-detail">
          <hr class="divider-dashed" />
          <div class="archive-grid">
            <div>
              <span class="archive-key">{{ t('archive.detail.first') }}</span><span class="num-mono">{{ draw.first }}</span>
            </div>
            <div>
              <span class="archive-key">{{ t('archive.detail.last2') }}</span><span class="num-mono">{{ draw.last2 }}</span>
            </div>
            <div>
              <span class="archive-key">{{ t('archive.detail.last3f') }}</span><span class="num-mono">{{ draw.last3f }}</span>
            </div>
            <div>
              <span class="archive-key">{{ t('archive.detail.last3b') }}</span><span class="num-mono">{{ draw.last3b }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination">
      <button class="btn btn-ghost focus-ring" :disabled="page <= 1" @click="page--">{{ t('archive.prev') }}</button>
      <span class="pagination-page num-mono">{{ t('archive.page', { p: page }) }}</span>
      <button class="btn btn-ghost focus-ring" :disabled="(data?.length ?? 0) < perPage" @click="page++">{{ t('archive.next') }}</button>
    </div>
  </div>
</template>

<style scoped>
.archive-filters {
  display: flex;
  gap: var(--gap-sm);
}

.filter-select {
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--text-sm);
  padding: 8px var(--gap-sm);
  min-height: var(--nav-link-height);
}

.archive-list {
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm);
}

.archive-item {
  padding: 0;
  overflow: hidden;
}

.archive-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  padding: var(--gap-md);
  background: transparent;
  text-align: left;
}

.archive-date {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  flex: 1;
}

.archive-first {
  font-size: var(--text-lg);
  color: var(--accent-gold);
  letter-spacing: 3px;
}

.archive-chevron {
  font-size: var(--text-xs);
  color: var(--accent-dim);
  margin-left: var(--gap-xs);
}

.archive-detail {
  padding: 0 var(--gap-md) var(--gap-md);
}

.archive-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gap-sm);
  font-size: var(--text-sm);
}

.archive-grid > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.archive-key {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--gap-md);
}

.pagination-page {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

/* ── Responsive Breakpoints (Mobile-First) ── */
@media (min-width: 480px) {
  .archive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
