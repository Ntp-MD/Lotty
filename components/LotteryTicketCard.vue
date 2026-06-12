<script setup lang="ts">
import { formatDate } from "~/composables/useDate";
import { useLanguage } from "~/composables/useLanguage";

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

const { t } = useLanguage();

function getGapClass(gap: number) {
  if (gap >= 10) return "gap-hot";
  if (gap >= 5) return "gap-warm";
  return "gap-normal";
}

const DISCLAIMER = computed(() => t("ticket.disclaimer"));
</script>

<template>
  <div class="ticket" role="region" aria-label="Recommended numbers for this draw">
    <div class="ticket-header">
      <div>
        <div class="ticket-title">{{ t('ticket.title', { date: formatDate(draw_date_next) }) }}</div>
        <div class="ticket-scope">{{ t('ticket.scope', { scope }) }}</div>
      </div>
    </div>

    <hr class="divider-dashed" />

    <div class="ticket-numbers">
      <div class="ticket-col">
        <span class="ticket-col-label">{{ t('results.last2') }}</span>
        <span class="ticket-number num-display">{{ suggestions.last2.number }}</span>
        <span class="ticket-gap num-mono" :class="getGapClass(suggestions.last2.gap)" v-if="suggestions.last2.gap > 0">
          {{ t('ticket.gap', { g: suggestions.last2.gap === 999 ? t('ticket.never') : `${suggestions.last2.gap} ${t('ticket.draws')}` }) }}
        </span>
      </div>
      <div class="ticket-col">
        <span class="ticket-col-label">{{ t('results.last3b') }}</span>
        <span class="ticket-number num-display">{{ suggestions.last3b.number }}</span>
        <span class="ticket-gap num-mono" :class="getGapClass(suggestions.last3b.gap)" v-if="suggestions.last3b.gap > 0">
          {{ t('ticket.gap', { g: suggestions.last3b.gap === 999 ? t('ticket.never') : `${suggestions.last3b.gap} ${t('ticket.draws')}` }) }}
        </span>
      </div>
      <div class="ticket-col">
        <span class="ticket-col-label">{{ t('results.last3f') }}</span>
        <span class="ticket-number num-display">{{ suggestions.last3f.number }}</span>
        <span class="ticket-gap num-mono" :class="getGapClass(suggestions.last3f.gap)" v-if="suggestions.last3f.gap > 0">
          {{ t('ticket.gap', { g: suggestions.last3f.gap === 999 ? t('ticket.never') : `${suggestions.last3f.gap} ${t('ticket.draws')}` }) }}
        </span>
      </div>
    </div>

    <hr class="divider-dashed" />

    <div class="ticket-rationale">
      <p>{{ rationale }}</p>
    </div>

    <details class="disclaimer-wrap">
      <summary class="disclaimer-toggle">{{ t('ticket.disclaimerToggle') }}</summary>
      <p class="disclaimer" role="note">{{ DISCLAIMER }}</p>
    </details>
  </div>
</template>

<style scoped>
.ticket {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--gap-md);
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
}

.ticket-header {
  display: flex;
  align-items: flex-start;
  gap: var(--gap-sm);
}

.ticket-icon {
  font-size: var(--text-xl);
  line-height: 1;
}

.ticket-title {
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  font-family: var(--font-display);
}

.ticket-scope {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.ticket-numbers {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gap-sm);
}

@media (min-width: 480px) {
  .ticket-numbers {
    grid-template-columns: repeat(3, 1fr);
  }
}

.ticket-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--gap-md);
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  text-align: center;
  gap: var(--gap-xs);
}

.ticket-col-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.ticket-number {
  color: var(--accent);
  letter-spacing: 2px;
  font-size: var(--text-xl);
}


.ticket-rationale {
  display: flex;
  gap: var(--gap-xs);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  background: var(--bg-base);
  padding: var(--gap-sm);
  border-radius: var(--radius-sm);
  border-left: 2px solid var(--border);
}

.ticket-rationale p {
  line-height: var(--leading-normal);
}

.disclaimer-wrap {
  border-top: 1px solid var(--border);
  padding-top: var(--gap-sm);
}

.disclaimer-toggle {
  font-size: var(--text-xs);
  color: var(--text-muted);
  cursor: pointer;
  list-style: none;
  user-select: none;
}

.disclaimer-toggle::-webkit-details-marker {
  display: none;
}

.disclaimer {
  font-size: var(--text-xs);
  color: var(--text-muted);
  line-height: var(--leading-normal);
  margin-top: var(--gap-xs);
}
</style>
