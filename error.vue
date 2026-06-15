<script setup lang="ts">
import { useLanguage } from "~/composables/useLanguage";

const { t } = useLanguage();
const error = useError();

const is404 = computed(() => error.value?.statusCode === 404);
const message = computed(() => error.value?.message ?? "Something went wrong");
</script>

<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-icon">{{ is404 ? "🔍" : "⚠️" }}</div>
      <h1 class="error-code">{{ error?.statusCode ?? 500 }}</h1>
      <p class="error-message">{{ is404 ? t('error.notFound') : message }}</p>
      <NuxtLink to="/" class="btn btn-primary focus-ring">
        {{ t('error.backHome') }}
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  background: var(--bg-surface);
  padding: var(--gap-lg);
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap-md);
  text-align: center;
  max-width: 400px;
}

.error-icon {
  font-size: 64px;
  line-height: 1;
}

.error-code {
  font-size: var(--text-4xl);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  margin: 0;
}

.error-message {
  font-size: var(--text-md);
  color: var(--text-secondary);
  margin: 0;
}

.btn-primary {
  background: var(--accent);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--gap-sm) var(--gap-lg);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: background var(--transition-fast);
  text-decoration: none;
}

.btn-primary:hover {
  background: var(--accent-dark);
}
</style>
