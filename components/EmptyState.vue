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
</script>

<template>
  <div class="empty card" role="status">
    <p class="empty-msg">{{ message }}</p>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap-sm);
  text-align: center;
  padding: var(--gap-lg);
}

.empty-msg { font-size: var(--text-sm); color: var(--text-secondary); }
</style>
