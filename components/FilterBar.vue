<script setup lang="ts">
import type { Scope, DrawDay } from "~/types";
import { useLanguage } from "~/composables/useLanguage";

const { filter, setScope, setMonth, setDay } = useFilter();
const { t } = useLanguage();
const showAdvanced = ref(false);

const scopes = computed<{ value: Scope; label: string }[]>(() => [
  { value: "1y", label: t("filter.1y") },
  { value: "3y", label: t("filter.3y") },
  { value: "5y", label: t("filter.5y") },
  { value: "10y", label: t("filter.10y") },
  { value: "all", label: t("filter.all") },
]);

const months = computed(() => [{ value: null, label: t("filter.allYear") }, ...Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: t("filter.monthName", { m: i + 1 }) }))]);

const days = computed<{ value: DrawDay; label: string }[]>(() => [
  { value: "all", label: t("filter.allDraws") },
  { value: "1", label: t("filter.1st") },
  { value: "16", label: t("filter.16th") },
]);
</script>

<template>
  <div class="filter-bar" role="search" aria-label="Data filter">
    <div class="filter-group">
      <span class="filter-label">{{ t('filter.timePeriod') }}</span>
      <div class="filter-chips" role="group" aria-label="Select time period">
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
      <span>{{ showAdvanced ? t('filter.advancedClose') : t('filter.advancedOpen') }}</span>
    </button>

    <div v-show="showAdvanced" class="filter-row filter-advanced">
      <div class="filter-group">
        <label class="filter-label" for="filter-month" :title="t('filter.monthDesc')">{{ t('filter.month') }}</label>
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
        <label class="filter-label" for="filter-day" :title="t('filter.drawDateDesc')">{{ t('filter.drawDate') }}</label>
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
  color: var(--color-white);
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
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-family: var(--font-body);
  padding: var(--gap-xs) var(--gap-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
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
