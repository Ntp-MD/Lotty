<script setup lang="ts">
interface Props {
  position: 1 | 2 | 3 | 4 | 5 | 6;
  freq: Record<string, number> | null;
  hot_digit: string | null;
  cold_digit: string | null;
}

const props = defineProps<Props>();

const posLabel = computed(() => {
  const labels = ["Hundred Thousand", "Ten Thousand", "Thousand", "Hundred", "Ten", "Unit"];
  return labels[props.position - 1];
});

const digits = computed(() =>
  Array.from({ length: 10 }, (_, i) => {
    const d = String(i);
    return { digit: d, count: props.freq?.[d] ?? 0 };
  }),
);

const maxCount = computed(() => Math.max(...digits.value.map((d) => d.count), 1));
</script>

<template>
  <div class="digit-chart card" :aria-label="`Statistics for position ${posLabel} of 1st prize`">
    <div class="digit-chart-header">
      <span class="digit-chart-pos">Position {{ posLabel }}</span>
      <span class="digit-chart-pos-num num-mono">{{ position }}</span>
    </div>
    <div class="digit-chart-info">
      <span class="badge-gold">Frequent: {{ hot_digit }}</span>
      <span class="badge-green">Rare: {{ cold_digit }}</span>
    </div>
    <div class="digit-bars" role="list">
      <div v-for="item in digits" :key="item.digit" class="digit-bar-item" role="listitem" :aria-label="`Number ${item.digit} appeared ${item.count} times`">
        <div class="digit-bar-track" :title="`Number ${item.digit}: appeared ${item.count} times`">
          <div
            class="digit-bar-fill"
            :class="{
              'digit-bar-fill-hot': item.digit === hot_digit,
              'digit-bar-fill-cold': item.digit === cold_digit,
            }"
            :style="{ height: `${(item.count / maxCount) * 100}%` }"
          ></div>
        </div>
        <span class="digit-bar-label">{{ item.digit }}</span>
        <span class="digit-bar-count num-mono">{{ item.count }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.digit-chart {
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm);
}


.digit-chart-header {
  display: flex;
  align-items: baseline;
  gap: var(--gap-xs);
}

.digit-chart-pos {
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
}

.digit-chart-pos-num {
  color: var(--accent);
}

.digit-chart-info {
  display: flex;
  gap: var(--gap-md);
  font-size: var(--text-xs);
}

.digit-bars {
  display: flex;
  gap: 4px;
  align-items: flex-end;
  flex: 1;
  min-height: 120px;
}

.digit-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  height: 100%;
}

.digit-bar-track {
  flex: 1;
  width: 100%;
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.digit-bar-fill {
  width: 100%;
  background: var(--accent-dim);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
}

.digit-bar-fill-hot {
  background: var(--accent);
}

.digit-bar-fill-cold {
  background: var(--accent-green);
}

.digit-bar-label {
  font-family: var(--font-mono);
  font-size: clamp(10px, 2.5vw, 11px);
  color: var(--text-secondary);
}

.digit-bar-count {
  font-size: clamp(9px, 2vw, 10px);
  color: var(--accent-dim);
}
</style>
