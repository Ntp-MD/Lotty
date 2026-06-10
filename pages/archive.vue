<script setup lang="ts">
import { formatDate } from "~/composables/useDate";
import type { DrawRecord } from "~/types";

useHead({ title: "ผลย้อนหลัง — Lotty" });

const page = ref(1);
const perPage = 20;
const filterYear = ref<number | null>(null);
const filterMonth = ref<number | null>(null);
const expanded = ref<number | null>(null);

const { data, pending, error } = await useAsyncData(
  "archive",
  async () => {
    const client = useSupabaseClient();
    let query = client.from("draws").select("*").order("draw_date", { ascending: false });
    if (filterYear.value)
      query = query.filter("draw_date", "gte", `${filterYear.value}-01-01`).filter("draw_date", "lte", `${filterYear.value}-12-31`);
    if (filterMonth.value) {
      const y = filterYear.value ?? new Date().getFullYear();
      const m = String(filterMonth.value).padStart(2, "0");
      const mNext = String(filterMonth.value + 1).padStart(2, "0");
      query = query
        .filter("draw_date", "gte", `${y}-${m}-01`)
        .filter("draw_date", "lt", filterMonth.value < 12 ? `${y}-${mNext}-01` : `${y + 1}-01-01`);
    }
    const { data: rows } = await query.range((page.value - 1) * perPage, page.value * perPage - 1);
    return rows as DrawRecord[];
  },
  { watch: [page, filterYear, filterMonth] },
);

const years = computed(() => {
  const current = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => current - i);
});
</script>

<template>
  <div class="page-content">
    <h1 class="section-title">ผลสลากย้อนหลัง</h1>

    <div class="archive-filters">
      <select
        class="filter-select focus-ring"
        :value="filterYear"
        @change="
          filterYear = ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null;
          page = 1;
        "
      >
        <option value="">ทุกปี</option>
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
        <option value="">ทุกเดือน</option>
        <option v-for="m in 12" :key="m" :value="m">เดือน {{ m }}</option>
      </select>
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
              <span class="archive-key">รางวัลที่ 1</span><span class="num-mono">{{ draw.first }}</span>
            </div>
            <div>
              <span class="archive-key">2 ตัวท้าย</span><span class="num-mono">{{ draw.last2 }}</span>
            </div>
            <div>
              <span class="archive-key">3 ตัวหน้า</span><span class="num-mono">{{ draw.last3f }}</span>
            </div>
            <div>
              <span class="archive-key">3 ตัวท้าย</span><span class="num-mono">{{ draw.last3b }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination">
      <button class="btn btn-ghost focus-ring" :disabled="page <= 1" @click="page--">← ก่อนหน้า</button>
      <span class="pagination-page num-mono">หน้า {{ page }}</span>
      <button class="btn btn-ghost focus-ring" :disabled="(data?.length ?? 0) < perPage" @click="page++">ถัดไป →</button>
    </div>
  </div>
</template>

<style scoped>
.page-content {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
  height: 100%;
  min-height: 0;
}

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
  min-height: 44px;
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

@media (min-width: 480px) {
  .archive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
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
</style>
