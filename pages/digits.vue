<script setup lang="ts">
import type { DigitsResponse, DigitPosition } from "~/types";

useHead({ title: "6 หลัก — Lotty" });

const { filter } = useFilter();

const asyncKey = computed(() => `digits-${filter.scope}`);

const { data, pending, error, refresh } = await useAsyncData(
  asyncKey,
  () => $fetch<DigitsResponse>("/api/stats/digits", { query: { scope: filter.scope } }),
  { watch: [asyncKey] },
);

const positions = computed<DigitPosition[]>(() => data.value?.data ?? []);

const locks = ref<Record<number, string>>({});

function toggleLock(pos: number, digit: string) {
  const current = locks.value[pos];
  locks.value = { ...locks.value, [pos]: current === digit ? "" : digit };
}

const comboFreq = computed(() => {
  const lockedPositions = Object.entries(locks.value).filter(([, d]) => d !== "");
  if (!lockedPositions.length) return null;

  let combined = 100;
  lockedPositions.forEach(([posStr, digit]) => {
    const posData = positions.value.find((p) => p.position === Number(posStr));
    if (posData) {
      const total = Object.values(posData.freq).reduce((a, b) => a + b, 0);
      const digitFreq = posData.freq[digit] ?? 0;
      combined = Math.round(((combined * (digitFreq / Math.max(total, 1))) / 100) * 100);
    }
  });
  return combined;
});
</script>

<template>
  <div>
    <FilterBar />
    <h1 class="section-title" style="margin-top: var(--gap-md)">รางวัลที่ 1 — แยก 6 หลัก</h1>

    <LoadingSkeleton v-if="pending" variant="chart" />
    <ErrorCard v-else-if="error" message="โหลดข้อมูลไม่สำเร็จ" :on-retry="refresh" />
    <EmptyState v-else-if="!positions.length" reason="no_data_in_range" :scope="filter.scope" />
    <template v-else>
      <section class="digits-grid">
        <DigitBarChart
          v-for="pos in positions"
          :key="pos.position"
          :position="pos.position"
          :freq="pos.freq"
          :hot_digit="pos.hot_digit"
          :cold_digit="pos.cold_digit"
        />
      </section>

      <section class="combo-finder card" style="margin-top: var(--gap-lg)">
        <h2 class="section-title">Combo Finder</h2>
        <p class="combo-hint">กด lock หลักที่ต้องการ แล้วดู pattern frequency</p>
        <div class="combo-locks">
          <div v-for="pos in positions" :key="pos.position" class="combo-pos">
            <span class="combo-pos-label">หลักที่ {{ pos.position }}</span>
            <div class="combo-digits">
              <button
                v-for="d in 10"
                :key="d - 1"
                class="combo-digit-btn focus-ring"
                :class="{ 'combo-digit-locked': locks[pos.position] === String(d - 1) }"
                @click="toggleLock(pos.position, String(d - 1))"
                :aria-pressed="locks[pos.position] === String(d - 1)"
                :aria-label="`ล็อกหลักที่ ${pos.position} เป็นเลข ${d - 1}`"
              >
                {{ d - 1 }}
              </button>
            </div>
          </div>
        </div>
        <div v-if="comboFreq !== null" class="combo-result">
          <span class="combo-result-label">Pattern frequency:</span>
          <span class="num-display combo-result-val">{{ comboFreq }}%</span>
        </div>
      </section>
    </template>
    <DisclaimerBanner />
  </div>
</template>

<style scoped>
.digits-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--gap-sm);
  margin-top: var(--gap-md);
}

@media (min-width: 768px) {
  .digits-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (min-width: 1024px) {
  .digits-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

.combo-hint {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: var(--gap-xs) 0 var(--gap-sm);
}
.combo-locks {
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm);
}
.combo-pos {
  display: flex;
  flex-direction: column;
  gap: var(--gap-xs);
}
.combo-pos-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}
.combo-digits {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.combo-digit-btn {
  min-width: 44px;
  min-height: 44px;
  padding: 8px;
  border-radius: var(--radius-sm);
  background: var(--bg-raised);
  border: 1px solid var(--border);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  transition:
    background var(--transition-fast),
    color var(--transition-fast);
}

.combo-digit-locked {
  background: var(--accent-gold);
  color: #0d0d0d;
  border-color: var(--accent-gold);
  font-weight: var(--weight-bold);
}

.combo-result {
  display: flex;
  align-items: center;
  gap: var(--gap-md);
  margin-top: var(--gap-md);
  padding-top: var(--gap-md);
  border-top: 1px solid var(--border-color-strong);
}

.combo-result-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
.combo-result-val {
  color: var(--accent-gold);
  font-size: var(--text-xl);
}
</style>
