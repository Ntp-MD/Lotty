<script setup lang="ts">
interface Props {
  message: string;
  onRetry?: () => void;
}

defineProps<Props>();
</script>

<template>
  <div class="error-card card" role="alert">
    <span class="error-icon" aria-hidden="true">⚠️</span>
    <p class="error-msg">{{ message }}</p>
    <button v-if="onRetry" class="btn btn-ghost" @click="onRetry">ลองใหม่</button>
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
}

.error-icon { font-size: 32px; }

.error-msg {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
</style>
