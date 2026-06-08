<script setup lang="ts">
import type { RankingItem } from "~/types";

interface Props {
  item: RankingItem;
  rank: number;
}

defineProps<Props>();
</script>

<template>
  <div
    class="podium-card card"
    :class="{
      'podium-card-hot': item.label === 'ออกบ่อย',
      'podium-card-cold': item.label === 'ไม่เคยออก',
    }"
  >
    <div class="podium-rank">
      <span class="podium-rank-num">{{ rank }}</span>
      <span class="podium-rank-icon" aria-hidden="true">
        {{ item.label === "ออกบ่อย" ? "🔥" : item.label === "ไม่เคยออก" ? "🧊" : "" }}
      </span>
    </div>
    <div class="podium-number num-display">{{ item.number }}</div>
    <div class="podium-meta">
      <div class="podium-bar" role="meter" :aria-valuenow="item.pct" aria-valuemin="0" aria-valuemax="100">
        <div class="podium-bar-fill" :style="{ width: `${item.pct}%` }"></div>
      </div>
      <span class="num-mono podium-pct">{{ (item.pct ?? 0).toFixed(1) }}%</span>
    </div>
    <div class="podium-last">
      <span class="podium-last-label">ออกล่าสุด</span>
      <span class="podium-last-val">{{ item.last_draw || "—" }}</span>
    </div>
    <div class="podium-gap" v-if="item.gap > 0">
      <span class="podium-gap-label">ห่างมา</span>
      <span class="podium-gap-val">{{ item.gap === 999 ? "ไม่เคยออก" : `${item.gap} งวด` }}</span>
    </div>
  </div>
</template>

<style scoped>
.podium-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--gap-sm);
  padding: clamp(var(--gap-sm), 3vw, var(--gap-md));
}

.podium-card-hot {
  border-left: 3px solid var(--accent-gold);
}
.podium-card-cold {
  border-left: 3px solid var(--accent-green);
}

.podium-rank {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: clamp(24px, 5vw, 32px);
  gap: 2px;
}

.podium-rank-num {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-muted);
  line-height: 1;
}

.podium-number {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  letter-spacing: 2px;
  min-width: clamp(48px, 12vw, 60px);
}

.podium-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.podium-bar {
  width: 100%;
  height: 4px;
  background: var(--bg-raised);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.podium-bar-fill {
  height: 100%;
  background: var(--accent);
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.podium-card-hot .podium-bar-fill {
  background: var(--accent-gold);
}
.podium-card-cold .podium-bar-fill {
  background: var(--accent-green);
}

.podium-pct {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.podium-last,
.podium-gap {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.podium-last-val,
.podium-gap-val {
  font-family: var(--font-mono);
  color: var(--text-secondary);
}
</style>
