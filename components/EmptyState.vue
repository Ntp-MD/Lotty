<script setup lang="ts">
import { useLanguage } from "~/composables/useLanguage";

interface Props {
  reason: "no_data_in_range" | "no_search_result";
  scope?: string;
}

const props = defineProps<Props>();
const { t } = useLanguage();

const message = computed(() => {
  if (props.reason === "no_search_result") return t("empty.no_search_result");
  return props.scope ? t("empty.no_data_in_range", { scope: props.scope }) : t("empty.no_data");
});

const icon = computed(() => {
  if (props.reason === "no_search_result") return "🔍";
  return "📭";
});
</script>

<template>
  <div class="empty card" role="status">
    <div class="empty-icon">{{ icon }}</div>
    <p class="empty-msg">{{ message }}</p>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap-md);
  text-align: center;
  padding: var(--gap-xl) var(--gap-lg);
  min-height: 200px;
  justify-content: center;
}

.empty-icon {
  font-size: 48px;
  line-height: 1;
  opacity: 0.5;
  animation: empty-bounce 2s ease-in-out infinite;
}

@keyframes empty-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.empty-msg {
  font-size: var(--text-md);
  color: var(--text-secondary);
  max-width: 300px;
  line-height: var(--leading-normal);
}
</style>
