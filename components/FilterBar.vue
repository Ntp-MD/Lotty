<script setup lang="ts">
import type { Scope, PrizeType, DrawDay } from "~/types";

const { filter, setScope, setPrizeType, setMonth, setDay } = useFilter();

const scopes: { value: Scope; label: string }[] = [
  { value: "1y", label: "1 ปี" },
  { value: "3y", label: "3 ปี" },
  { value: "5y", label: "5 ปี" },
  { value: "10y", label: "10 ปี" },
  { value: "all", label: "ทั้งหมด" },
];

const prizeTypes: { value: PrizeType; label: string }[] = [
  { value: "last2", label: "2 ตัวล่าง" },
  { value: "first2", label: "2 ตัวบน" },
  { value: "last3b", label: "3 ตัวล่าง" },
  { value: "last3f", label: "3 ตัวหน้า" },
  { value: "first", label: "รางวัลที่ 1" },
];

const months = [{ value: null, label: "ทั้งปี" }, ...Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `เดือน ${i + 1}` }))];

const days: { value: DrawDay; label: string }[] = [
  { value: "all", label: "ทุกงวด" },
  { value: "1", label: "1 ของเดือน" },
  { value: "16", label: "16 ของเดือน" },
];
</script>

<template>
  <div class="filter-bar" role="search" aria-label="ตัวกรองข้อมูล">
    <div class="filter-group">
      <span class="filter-label">ช่วงเวลา</span>
      <div class="filter-chips" role="group" aria-label="เลือกช่วงเวลา">
        <button
          v-for="s in scopes"
          :key="s.value"
          class="chip focus-ring"
          :class="{ 'chip-active': filter.scope === s.value }"
          @click="setScope(s.value)"
          :aria-pressed="filter.scope === s.value"
        >
          {{ s.label }}
        </button>
      </div>
    </div>

    <div class="filter-group">
      <span class="filter-label">ประเภทรางวัล</span>
      <div class="filter-chips" role="group" aria-label="เลือกประเภทรางวัล">
        <button
          v-for="p in prizeTypes"
          :key="p.value"
          class="chip focus-ring"
          :class="{ 'chip-active': filter.prizeType === p.value }"
          @click="setPrizeType(p.value)"
          :aria-pressed="filter.prizeType === p.value"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <div class="filter-row">
      <div class="filter-group">
        <label class="filter-label" for="filter-month">เดือน</label>
        <select
          id="filter-month"
          class="filter-select focus-ring"
          :value="filter.month"
          @change="setMonth(($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null)"
        >
          <option v-for="m in months" :key="String(m.value)" :value="m.value ?? ''">{{ m.label }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label" for="filter-day">วันที่ออก</label>
        <select
          id="filter-day"
          class="filter-select focus-ring"
          :value="filter.day"
          @change="setDay(($event.target as HTMLSelectElement).value as DrawDay)"
        >
          <option v-for="d in days" :key="d.value" :value="d.value">{{ d.label }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  padding: clamp(var(--gap-sm), 3vw, var(--gap-md));
  margin-bottom: var(--gap-md);
}

@media (min-width: 768px) {
  .filter-bar {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--gap-xs);
}

@media (min-width: 768px) {
  .filter-group {
    flex-direction: row;
    align-items: center;
    gap: var(--gap-sm);
  }
}

.filter-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-weight: var(--weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.chip {
  min-height: 40px;
  padding: 8px 20px;
  min-width: 80px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-family: var(--font-body);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  background: var(--bg-surface);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: grid;
  align-items: center;
  text-align: center;
}

.chip:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

.chip-active {
  background: var(--accent);
  color: #ffffff;
  border-color: var(--accent);
  font-weight: var(--weight-medium);
}

.filter-row {
  display: flex;
  gap: var(--gap-sm);
  align-items: center;
}

.filter-select {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--text-xs);
  padding: 8px var(--gap-sm);
  min-height: 40px;
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.filter-select:focus {
  outline: none;
  border-color: var(--accent);
}
</style>
