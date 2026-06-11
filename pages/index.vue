<script setup lang="ts">
import type { AdvisorResponse, StatsResponse, DigitsResponse, DigitPosition } from "~/types";
import { formatDate } from "~/composables/useDate";

useHead({ title: "Recommended Numbers — Lotty" });

const { filter, scopeLabel } = useFilter();

const asyncKey = computed(() => `advisor-${filter.scope}`);

const { data, pending, error, refresh } = await useAsyncData(
  asyncKey,
  () => $fetch<AdvisorResponse>("/api/advisor", { query: { scope: filter.scope } }),
  { watch: [asyncKey] },
);

const advisor = computed(() => data.value?.data);

const quickPick = ref<{ last2: string; last3b: string; last3f: string } | null>(null);
const quickPickLoading = ref(false);

async function generateQuickPick() {
  quickPickLoading.value = true;
  try {
    const stats2 = await $fetch<StatsResponse>("/api/stats/2digit", { query: { scope: filter.scope, type: "last2" } });
    const stats3b = await $fetch<StatsResponse>("/api/stats/3digit", { query: { scope: filter.scope, type: "last3b" } });
    const stats3f = await $fetch<StatsResponse>("/api/stats/3digit", { query: { scope: filter.scope, type: "last3f" } });

    function weightedRandom(ranking: typeof stats2.data.ranking) {
      const weights = ranking.map((r) => r.gap + 1);
      const total = weights.reduce((a, b) => a + b, 0);
      let rnd = Math.random() * total;
      for (let i = 0; i < ranking.length; i++) {
        rnd -= weights[i];
        if (rnd <= 0) return ranking[i].number;
      }
      return ranking[0]?.number ?? "?";
    }

    quickPick.value = {
      last2: weightedRandom(stats2.data.ranking),
      last3b: weightedRandom(stats3b.data.ranking),
      last3f: weightedRandom(stats3f.data.ranking),
    };
  } finally {
    quickPickLoading.value = false;
  }
}

const lookupQuery = ref("");
const lookupResult = ref<null | { number: string; count: number; last_draw: string; gap: number; rank: number; total: number; label: string }>(null);
const lookupPending = ref(false);

const { data: latestDraw, pending: latestDrawPending } = await useFetch("/api/latest-draw");

// 6-digit stats
const digitsAsyncKey = computed(() => `digits-${filter.scope}`);
const { data: digitsData, pending: digitsPending, error: digitsError, refresh: refreshDigits } = await useAsyncData(
  digitsAsyncKey,
  () => $fetch<DigitsResponse>("/api/stats/digits", { query: { scope: filter.scope } }),
  { watch: [digitsAsyncKey] },
);

const positions = computed<DigitPosition[]>(() => digitsData.value?.data ?? []);

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

async function doLookup() {
  const q = lookupQuery.value.trim();
  if (q.length < 2 || q.length > 3) return;
  lookupPending.value = true;
  try {
    const res = await $fetch<{ data: typeof lookupResult.value }>("/api/stats/lookup", { query: { number: q, scope: filter.scope } });
    lookupResult.value = res.data;
  } finally {
    lookupPending.value = false;
  }
}

function validateNumericInput(e: Event) {
  const input = e.target as HTMLInputElement;
  input.value = input.value.replace(/[^0-9]/g, "");
  lookupQuery.value = input.value;
}

function copyQuickPick() {
  if (!quickPick.value) return;
  const text = `2 Digit: ${quickPick.value.last2}\n3 Digit Bottom: ${quickPick.value.last3b}\n3 Digit Front: ${quickPick.value.last3f}`;
  navigator.clipboard.writeText(text);
}
</script>

<template>
  <div class="page-content">
    <FilterBar />

    <h1 v-if="latestDraw?.data" class="section-title">Latest Draw Results</h1>
    <div v-if="latestDraw?.data" class="card">
      <div class="latest-draw-date">{{ formatDate(latestDraw.data.draw_date) }}</div>
      <div class="latest-draw-numbers">
        <div class="latest-draw-col latest-draw-col-hero">
          <span class="latest-draw-label">1st Prize</span>
          <span class="num-display latest-draw-number-hero">{{ latestDraw.data.first }}</span>
        </div>
        <div class="latest-draw-col">
          <span class="latest-draw-label">3 Digit Front</span>
          <span class="num-display latest-draw-number">{{ latestDraw.data.last3f }}</span>
        </div>
        <div class="latest-draw-col">
          <span class="latest-draw-label">3 Digit Bottom</span>
          <span class="num-display latest-draw-number">{{ latestDraw.data.last3b }}</span>
        </div>
        <div class="latest-draw-col">
          <span class="latest-draw-label">2 Digit Bottom</span>
          <span class="num-display latest-draw-number">{{ latestDraw.data.last2 }}</span>
        </div>
      </div>
    </div>

    <h1 class="section-title">Recommended Numbers</h1>

    <LoadingSkeleton v-if="pending" variant="ticket" />
    <ErrorCard v-else-if="error" message="โหลดข้อมูลไม่สำเร็จ" :on-retry="refresh" />
    <EmptyState v-else-if="!advisor" reason="no_data_in_range" :scope="filter.scope" />
    <template v-else>
      <div class="card">
        <LotteryTicketCard
          :draw_date_next="advisor.draw_date_next"
          :suggestions="advisor.suggestions"
          :rationale="advisor.rationale"
          :scope="scopeLabel"
        />
      </div>

      <h2 class="section-title section-title-sub">Quick Pick & Number Statistics</h2>
      <div class="card">
          <div class="tools-section">
            <div class="tools-row">
              <div class="tool-block">
                <h3 class="tool-title">Quick Pick</h3>
                <p style="font-size: var(--text-sm); color: var(--text-secondary)">
                  Random by statistics — numbers with longer gaps get more weight
                </p>
                <div class="quickpick-actions">
                  <button class="btn btn-gold" @click="generateQuickPick" :disabled="quickPickLoading">
                    <span v-if="quickPickLoading">Calculating...</span>
                    <span v-else>Random by Statistics</span>
                  </button>
                  <button class="btn btn-ghost" @click="quickPick = null" v-if="quickPick && !quickPickLoading">Reset</button>
                </div>
                <div v-if="quickPick" class="quickpick-result">
                  <div class="quickpick-numbers">
                    <div class="quickpick-col">
                      <span class="quickpick-label">2 Digit Bottom</span>
                      <span class="num-display quickpick-num">{{ quickPick.last2 }}</span>
                    </div>
                    <div class="quickpick-col">
                      <span class="quickpick-label">3 Digit Bottom</span>
                      <span class="num-display quickpick-num">{{ quickPick.last3b }}</span>
                    </div>
                    <div class="quickpick-col">
                      <span class="quickpick-label">3 Digit Front</span>
                      <span class="num-display quickpick-num">{{ quickPick.last3f }}</span>
                    </div>
                  </div>
                  <button class="btn btn-sm btn-ghost" @click="copyQuickPick">
                    Copy Numbers
                  </button>
                </div>
              </div>

              <div class="tool-divider"></div>

              <div class="tool-block">
                <h3 class="tool-title">Number Statistics Lookup</h3>
                <div class="lookup-row">
                  <input
                    v-model="lookupQuery"
                    class="search-input focus-ring"
                    type="text"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    placeholder="Enter 2–3 digit number"
                    maxlength="3"
                    aria-label="Search number statistics"
                    @keydown.enter="doLookup"
                    @input="validateNumericInput"
                  />
                  <button class="btn btn-gold" @click="doLookup" :disabled="lookupPending || lookupQuery.length < 2">
                    {{ lookupPending ? "Searching..." : "Search" }}
                  </button>
                </div>
                <div v-if="lookupResult" class="lookup-result">
                  <div
                    class="num-display lookup-number"
                    :class="{ 'badge-gold': lookupResult.label === 'Frequent', 'badge-green': lookupResult.label === 'Never' }"
                  >
                    {{ lookupResult.number }}
                  </div>
                  <div class="lookup-grid">
                    <div>
                      <span class="lookup-key">Total Appeared</span><span class="num-mono">{{ lookupResult.count }} times</span>
                    </div>
                    <div>
                      <span class="lookup-key">Rank</span><span class="num-mono">{{ lookupResult.rank }} / {{ lookupResult.total }}</span>
                    </div>
                    <div>
                      <span class="lookup-key">Latest</span><span class="num-mono">{{ lookupResult.last_draw || "—" }}</span>
                    </div>
                    <div>
                      <span class="lookup-key">Gap</span
                      ><span class="num-mono">{{ lookupResult.gap === 999 ? "Never" : `${lookupResult.gap} draws` }}</span>
                    </div>
                  </div>
                </div>
                <EmptyState v-else-if="lookupQuery && !lookupPending" reason="no_search_result" />
              </div>
            </div>

            <div class="tool-divider-horizontal"></div>

            <div class="tool-block combo-block">
              <details class="combo-collapse">
              <summary class="combo-summary">
                <span class="tool-title">Combo Finder</span>
                <span class="combo-summary-hint">Click to open</span>
              </summary>
              <p class="combo-hint">Click lock on desired positions and check pattern frequency</p>
              <div class="combo-locks">
                <div v-for="pos in positions" :key="pos.position" class="combo-pos">
                  <span class="combo-pos-label">Position {{ pos.position }}</span>
                  <div class="combo-digits">
                    <button
                      v-for="d in 10"
                      :key="d - 1"
                      class="combo-digit-btn focus-ring"
                      :class="{ 'combo-digit-locked': locks[pos.position] === String(d - 1) }"
                      @click="toggleLock(pos.position, String(d - 1))"
                      :aria-pressed="locks[pos.position] === String(d - 1)"
                      :aria-label="`Lock position ${pos.position} to number ${d - 1}`"
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
              </details>
            </div>
          </div>
      </div>

      <h2 class="section-title section-title-sub">1st Prize — 6 Digit Breakdown</h2>
      <div class="card">
        <LoadingSkeleton v-if="digitsPending" variant="chart" />
        <ErrorCard v-else-if="digitsError" message="โหลดข้อมูลไม่สำเร็จ" :on-retry="refreshDigits" />
        <EmptyState v-else-if="!positions.length" reason="no_data_in_range" :scope="filter.scope" />
        <div v-else class="digits-grid">
          <DigitBarChart
            v-for="pos in positions"
            :key="pos.position"
            :position="pos.position"
            :freq="pos.freq"
            :hot_digit="pos.hot_digit"
            :cold_digit="pos.cold_digit"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-content {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
  height: 100%;
  min-height: 0;
}

.section-title-sub {
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  color: var(--text-secondary);
  letter-spacing: 0;
  text-transform: none;
}

.latest-draw-number-hero {
  font-size: var(--text-xl);
  color: var(--accent);
  font-weight: var(--weight-bold);
  letter-spacing: 3px;
  line-height: 1;
}

.latest-draw-col-hero {
  grid-column: span 2;
  border-color: var(--accent);
  background: var(--accent-light);
}

@media (min-width: 640px) {
  .latest-draw-col-hero {
    grid-column: span 1;
  }
}

.combo-collapse {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm);
}

.combo-summary {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  cursor: pointer;
  user-select: none;
  list-style: none;
  padding: var(--gap-xs) 0;
}

.combo-summary::-webkit-details-marker {
  display: none;
}

.combo-summary::after {
  content: '▸';
  color: var(--text-muted);
  font-size: var(--text-sm);
  transition: transform var(--transition-fast);
  margin-left: auto;
}

.combo-collapse[open] > .combo-summary::after {
  transform: rotate(90deg);
}

.combo-summary-hint {
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-weight: var(--weight-regular);
}

.combo-collapse[open] .combo-summary-hint {
  display: none;
}

.tools-section {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
}

.tools-row {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
}

@media (min-width: 768px) {
  .tools-row {
    flex-direction: row;
  }
}

.tool-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm);
}

@media (min-width: 1024px) {
  .tool-block {
    height: 100%;
  }
}

.combo-block {
  flex: none;
}

.tool-title {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--gap-xs) 0;
}

.tool-divider {
  display: none;
}

@media (min-width: 768px) {
  .tool-divider {
    display: block;
    width: 1px;
    background: var(--border);
  }
}

.tool-divider-horizontal {
  width: 100%;
  height: 1px;
  background: var(--border);
}

.latest-draw-date {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
  margin-bottom: var(--gap-md);
}

.latest-draw-numbers {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--gap-sm);
}

@media (min-width: 640px) {
  .latest-draw-numbers {
    grid-template-columns: repeat(4, 1fr);
  }
}

.latest-draw-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--gap-md);
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  text-align: center;
  min-height: 80px;
  gap: var(--gap-xs);
  transition: all 0.2s ease;
}

.latest-draw-col:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.latest-draw-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.latest-draw-number {
  font-size: var(--text-lg);
  color: var(--accent);
  font-weight: var(--weight-bold);
  letter-spacing: 2px;
}

.quickpick-actions {
  display: flex;
  gap: var(--gap-sm);
}
.quickpick-result {
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm);
}

.quickpick-numbers {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--gap-sm);
}

.quickpick-col {
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

.quickpick-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.quickpick-num {
  color: var(--accent);
  letter-spacing: 2px;
  font-size: var(--text-xl);
}

.lookup-row {
  display: flex;
  gap: var(--gap-sm);
  align-items: center;
}
.search-input {
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  padding: var(--gap-xs) var(--gap-sm);
  font-family: var(--font-mono);
  font-size: var(--text-md);
  width: 100%;
  flex: 1;
  transition: border-color var(--transition-fast);
}

.search-input:focus {
  border-color: var(--accent);
}

.lookup-number {
  font-size: var(--text-xl);
}
.lookup-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--gap-sm);
  font-size: var(--text-sm);
}
.lookup-grid > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.lookup-key {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.digits-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--gap-sm);
  height: 100%;
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
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
