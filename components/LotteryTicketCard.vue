<script setup lang="ts">
interface Suggestion {
  number: string;
  gap: number;
  avg_gap: number;
}

interface Props {
  draw_date_next: string;
  suggestions: { last2: Suggestion; last3b: Suggestion; last3f: Suggestion };
  rationale: string;
  scope: string;
}

defineProps<Props>();

const DISCLAIMER =
  "ข้อมูลทั้งหมดเป็นสถิติจากผลการออกรางวัลในอดีต ไม่ใช่การพยากรณ์หรือรับประกันผลรางวัล สลากกินแบ่งรัฐบาลเป็นการเสี่ยงโชค โปรดใช้วิจารณญาณในการตัดสินใจ";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}
</script>

<template>
  <div class="ticket" role="region" aria-label="เลขแนะนำงวดนี้">
    <div class="ticket-header">
      <span class="ticket-icon" aria-hidden="true">🎯</span>
      <div>
        <div class="ticket-title">เลขแนะนำงวด {{ formatDate(draw_date_next) }}</div>
        <div class="ticket-scope">อิงสถิติ {{ scope }} ย้อนหลัง</div>
      </div>
    </div>

    <hr class="divider-dashed" />

    <div class="ticket-numbers">
      <div class="ticket-row">
        <span class="ticket-row-label">2 ตัวล่าง</span>
        <span class="ticket-number num-display">{{ suggestions.last2.number }}</span>
        <span class="ticket-gap num-mono" v-if="suggestions.last2.gap > 0"
          >ค้างมา {{ suggestions.last2.gap === 999 ? "ไม่เคยออก" : `${suggestions.last2.gap} งวด` }}</span
        >
      </div>
      <div class="ticket-row">
        <span class="ticket-row-label">3 ตัวล่าง</span>
        <span class="ticket-number num-display">{{ suggestions.last3b.number }}</span>
        <span class="ticket-gap num-mono" v-if="suggestions.last3b.gap > 0"
          >ค้างมา {{ suggestions.last3b.gap === 999 ? "ไม่เคยออก" : `${suggestions.last3b.gap} งวด` }}</span
        >
      </div>
      <div class="ticket-row">
        <span class="ticket-row-label">3 ตัวหน้า</span>
        <span class="ticket-number num-display">{{ suggestions.last3f.number }}</span>
        <span class="ticket-gap num-mono" v-if="suggestions.last3f.gap > 0"
          >ค้างมา {{ suggestions.last3f.gap === 999 ? "ไม่เคยออก" : `${suggestions.last3f.gap} งวด` }}</span
        >
      </div>
    </div>

    <hr class="divider-dashed" />

    <div class="ticket-rationale">
      <span class="ticket-rationale-icon" aria-hidden="true">💡</span>
      <p>{{ rationale }}</p>
    </div>

    <p class="disclaimer" role="note">{{ DISCLAIMER }}</p>
  </div>
</template>

<style scoped>
.ticket {
  background: var(--bg-surface);
  border: 1px dashed var(--border-color-strong);
  border-top: 2px solid var(--accent-gold);
  border-radius: var(--radius-md);
  padding: var(--gap-md);
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm);
  position: relative;
  box-shadow: var(--glow-hot);
}

.ticket-header {
  display: flex;
  align-items: flex-start;
  gap: var(--gap-sm);
}

.ticket-icon {
  font-size: 24px;
  line-height: 1;
}

.ticket-title {
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
  color: var(--accent-gold);
  font-family: var(--font-display);
}

.ticket-scope {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.ticket-numbers {
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm);
}

.ticket-row {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
}

.ticket-row-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  min-width: 70px;
}

.ticket-number {
  color: var(--accent-gold);
  letter-spacing: 4px;
}

.ticket-gap {
  font-size: var(--text-xs);
  color: var(--accent-red);
  margin-left: auto;
}

.ticket-rationale {
  display: flex;
  gap: var(--gap-xs);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.ticket-rationale p {
  line-height: var(--leading-normal);
}
</style>
