<script setup lang="ts">
interface Props {
  variant: "heatmap" | "podium" | "chart" | "ticket";
  rows?: number;
}

const props = withDefaults(defineProps<Props>(), { rows: 5 });
</script>

<template>
  <div class="skeleton-wrap" aria-busy="true" aria-label="Loading data">
    <template v-if="variant === 'heatmap'">
      <div class="skeleton-heatmap">
        <div v-for="r in 10" :key="r" class="skeleton-heatmap-row">
          <div v-for="c in 10" :key="c" class="skeleton skeleton-cell"></div>
        </div>
      </div>
    </template>

    <template v-else-if="variant === 'podium'">
      <div class="skeleton-podium">
        <div v-for="i in props.rows" :key="i" class="skeleton skeleton-podium-item"></div>
      </div>
    </template>

    <template v-else-if="variant === 'chart'">
      <div class="skeleton-chart">
        <div v-for="i in 6" :key="i" class="skeleton skeleton-chart-col"></div>
      </div>
    </template>

    <template v-else-if="variant === 'ticket'">
      <div class="skeleton skeleton-ticket"></div>
    </template>
  </div>
</template>

<style scoped>
.skeleton-heatmap { display: flex; flex-direction: column; gap: 2px; }
.skeleton-heatmap-row { display: flex; gap: 2px; }
.skeleton-cell { flex: 1; min-width: 44px; height: 44px; border-radius: var(--radius-sm); }
.skeleton-podium { display: flex; flex-direction: column; gap: var(--gap-sm); }
.skeleton-podium-item { height: 80px; border-radius: var(--radius-md); }
.skeleton-chart { display: flex; gap: var(--gap-sm); }
.skeleton-chart-col { flex: 1; height: 160px; border-radius: var(--radius-md); }
.skeleton-ticket { height: 200px; border-radius: var(--radius-md); }
</style>
