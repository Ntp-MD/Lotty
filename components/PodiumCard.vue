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
    class="podium-item"
    :class="{
      'podium-item-hot':  item.label === 'ออกบ่อย',
      'podium-item-cold': item.label === 'ไม่เคยออก',
    }"
  >
    <!-- rank avatar -->
    <div class="podium-rank-avatar" :class="rank <= 3 ? 'podium-rank-top' : ''">
      {{ rank }}
    </div>

    <!-- number + meta -->
    <div class="podium-info">
      <span class="num-display podium-number">{{ item.number }}</span>
      <div class="podium-bar-wrap">
        <div class="podium-bar">
          <div class="podium-bar-fill" :style="{ width: `${item.pct}%` }"></div>
        </div>
        <span class="num-mono podium-pct">{{ (item.pct ?? 0).toFixed(1) }}%</span>
      </div>
    </div>

    <!-- right: gap badge -->
    <div class="podium-right">
      <span v-if="item.label === 'ออกบ่อย'" class="badge-hot">ออกบ่อย</span>
      <span v-else-if="item.gap > 0" class="podium-gap-label">
        {{ item.gap === 999 ? "ไม่เคย" : `${item.gap} งวด` }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.podium-item {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  padding: var(--gap-sm) 0;
  border-bottom: 1px solid var(--border);
}

.podium-item:last-child {
  border-bottom: none;
}

.podium-item-hot {
  border-left: 3px solid var(--accent-gold);
  padding-left: var(--gap-sm);
}

.podium-item-cold {
  border-left: 3px solid var(--accent-green);
  padding-left: var(--gap-sm);
}

.podium-rank-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--bg-raised);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  flex-shrink: 0;
}

.podium-rank-top {
  background: var(--accent-light);
  color: var(--accent);
}

.podium-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.podium-number {
  font-size: var(--text-md);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  letter-spacing: 2px;
}

.podium-bar-wrap {
  display: flex;
  align-items: center;
  gap: var(--gap-xs);
}

.podium-bar {
  flex: 1;
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

.podium-pct {
  font-size: var(--text-xs);
  color: var(--text-muted);
  white-space: nowrap;
}

.podium-right {
  flex-shrink: 0;
}

.podium-gap-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
  white-space: nowrap;
}
</style>
