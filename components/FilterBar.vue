<script setup lang="ts">
import type { Scope, DrawDay } from "~/types";

const { filter, setScope, setMonth, setDay } = useFilter();
const showAdvanced = ref(false);

const scopes: { value: Scope; label: string }[] = [
  { value: "1y", label: "1 ปี" },
  { value: "3y", label: "3 ปี" },
  { value: "5y", label: "5 ปี" },
  { value: "10y", label: "10 ปี" },
  { value: "all", label: "ทั้งหมด" },
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

    <button class="btn-toggle-advanced" @click="showAdvanced = !showAdvanced" type="button">
      <span>{{ showAdvanced ? '-' : '+' }} ตัวเลือกเพิ่มเติม</span>
    </button>

    <div v-show="showAdvanced" class="filter-row filter-advanced">
      <div class="filter-group">
        <label class="filter-label" for="filter-month" title="กรองตามเดือนที่ออกรางวัล">เดือน</label>
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
        <label class="filter-label" for="filter-day" title="กรองตามวันที่ออกรางวัล (1 หรือ 16)">วันที่ออก</label>
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
  gap: var(--gap-sm);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  flex-wrap: wrap;
}

.filter-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--text-muted);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.filter-chips {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

/* chip = pill tab */
.chip {
  padding: 5px var(--gap-sm);
  border-radius: var(--radius-full);
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-body);
  white-space: nowrap;
}

.chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.chip-active {
  background: var(--accent);
  border-color: var(--accent);
  color: #ffffff;
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
  padding: var(--gap-xs) var(--gap-sm);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.filter-select:focus {
  outline: none;
  border-color: var(--accent);
}

.btn-toggle-advanced {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: var(--text-xs);
  padding: var(--gap-xs) 0;
  cursor: pointer;
  transition: color var(--transition-fast);
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-toggle-advanced:hover {
  color: var(--accent);
}

.filter-advanced {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
