<script setup lang="ts">
import type { RankingItem } from "~/types";

interface Props {
  data: RankingItem[];
  selected: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ select: [number: string] }>();

const cells = computed(() => {
  const map = new Map(props.data.map((d) => [d.number, d]));
  return Array.from({ length: 100 }, (_, i) => {
    const num = String(i).padStart(2, "0");
    return map.get(num) ?? { number: num, count: 0, last_draw: "", gap: 0, pct: 0, label: "ปกติ" as const };
  });
});

const maxCount = computed(() => Math.max(...props.data.map((d) => d.count), 1));

function cellOpacity(count: number) {
  return 0.1 + (count / maxCount.value) * 0.9;
}

function onKeydown(e: KeyboardEvent, idx: number) {
  const cols = 10;
  const map: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols };
  const delta = map[e.key];
  if (delta === undefined) return;
  e.preventDefault();
  const next = Math.max(0, Math.min(99, idx + delta));
  const el = document.querySelector<HTMLElement>(`[data-cell="${next}"]`);
  el?.focus();
}
</script>

<template>
  <div class="heatmap" role="grid" aria-label="Heatmap ความถี่เลข 2 ตัว">
    <div class="heatmap-row" v-for="row in 10" :key="row" role="row">
      <button
        v-for="col in 10"
        :key="col"
        :data-cell="(row - 1) * 10 + (col - 1)"
        class="heatmap-cell focus-ring"
        :class="{
          'heatmap-cell-hot': cells[(row - 1) * 10 + (col - 1)].label === 'ออกบ่อย',
          'heatmap-cell-cold': cells[(row - 1) * 10 + (col - 1)].label === 'ไม่เคยออก',
          'heatmap-cell-selected': selected === cells[(row - 1) * 10 + (col - 1)].number,
        }"
        :style="{ '--cell-opacity': cellOpacity(cells[(row - 1) * 10 + (col - 1)].count) }"
        role="gridcell"
        :aria-label="`เลข ${cells[(row - 1) * 10 + (col - 1)].number} ออก ${cells[(row - 1) * 10 + (col - 1)].count} ครั้ง`"
        :aria-selected="selected === cells[(row - 1) * 10 + (col - 1)].number"
        :tabindex="row === 1 && col === 1 ? 0 : -1"
        @click="emit('select', cells[(row - 1) * 10 + (col - 1)].number)"
        @keydown="onKeydown($event, (row - 1) * 10 + (col - 1))"
      >
        <span class="heatmap-num">{{ cells[(row - 1) * 10 + (col - 1)].number }}</span>
        <span class="heatmap-tooltip" role="tooltip">
          ออก {{ cells[(row - 1) * 10 + (col - 1)].count }} ครั้ง<br />
          ล่าสุด: {{ cells[(row - 1) * 10 + (col - 1)].last_draw || "—" }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.heatmap {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.heatmap-row {
  display: flex;
  gap: 2px;
}

.heatmap-cell {
  position: relative;
  flex: 1;
  aspect-ratio: 1;
  min-width: clamp(36px, 8vw, 52px);
  min-height: clamp(36px, 8vw, 52px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--accent-gold) calc(var(--cell-opacity) * 100%), var(--bg-raised));
  border: 1px solid transparent;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
  cursor: pointer;
  overflow: visible;
}

.heatmap-cell:hover,
.heatmap-cell:focus-visible {
  border-color: var(--accent-gold);
  z-index: 10;
}

.heatmap-cell-hot {
  box-shadow: var(--glow-hot);
}

.heatmap-cell-cold {
  background: color-mix(in srgb, var(--accent-green) 20%, var(--bg-raised));
}

.heatmap-cell-selected {
  border-color: var(--accent-gold);
  box-shadow: var(--glow-hot);
}

.heatmap-num {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  pointer-events: none;
}

.heatmap-tooltip {
  display: none;
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-raised);
  border: 1px solid var(--border-color-strong);
  border-radius: var(--radius-sm);
  padding: var(--gap-xs) var(--gap-sm);
  font-size: var(--text-xs);
  color: var(--text-primary);
  white-space: nowrap;
  pointer-events: none;
  z-index: 20;
  box-shadow: var(--shadow-raised);
  line-height: var(--leading-normal);
}

.heatmap-cell:hover .heatmap-tooltip,
.heatmap-cell:focus-visible .heatmap-tooltip {
  display: block;
}
</style>
