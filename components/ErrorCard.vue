<script setup lang="ts">
import { useLanguage } from "~/composables/useLanguage";

interface Props {
  message: string;
  onRetry?: () => void;
}

defineProps<Props>();
const { t } = useLanguage();
</script>

<template>
  <div class="error-card card" role="alert">
    <p class="error-msg">{{ message }}</p>
    <button v-if="onRetry" class="btn btn-ghost" @click="onRetry">{{ t('error.retry') }}</button>
  </div>
</template>

<style scoped>
.error-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap-sm);
  text-align: center;
  padding: var(--gap-lg);
  border-color: var(--accent-danger);
  background: color-mix(in srgb, var(--accent-danger) 12%, var(--bg-surface));
}

.error-msg {
  font-size: var(--text-sm);
  color: var(--accent-danger);
}
</style>
