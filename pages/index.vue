<script setup lang="ts">
import type { AdvisorResponse, StatsResponse, DigitsResponse, DigitPosition } from "~/types";
import { formatDate } from "~/composables/useDate";

useHead({ title: "เลขแนะนำ — Lotty" });

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
  const text = `2ตัว: ${quickPick.value.last2}\n3ตัวล่าง: ${quickPick.value.last3b}\n3ตัวหน้า: ${quickPick.value.last3f}`;
  navigator.clipboard.writeText(text);
}
</script>

<template>
  <div class="page-content">
    <FilterBar />

    <!-- ── Stat Row — ผลล่าสุด ── -->
    <section v-if="latestDraw?.data" class="stats-row">
      <div class="card">
        <div class="card-body stat-widget">
          <div class="stat-widget-header">
            <div class="stat-avatar stat-avatar-primary">🎯</div>
          </div>
          <p class="stat-label">รางวัลที่ 1</p>
          <p class="stat-value">{{ latestDraw.data.first }}</p>
          <span class="stat-trend stat-trend-warm">งวด {{ formatDate(latestDraw.data.draw_date) }}</span>
        </div>
      </div>
      <div class="card">
        <div class="card-body stat-widget">
          <div class="stat-widget-header">
            <div class="stat-avatar stat-avatar-gold">3↓</div>
          </div>
          <p class="stat-label">3 ตัวล่าง</p>
          <p class="stat-value">{{ latestDraw.data.last3b }}</p>
        </div>
      </div>
      <div class="card">
        <div class="card-body stat-widget">
          <div class="stat-widget-header">
            <div class="stat-avatar stat-avatar-info">2↓</div>
          </div>
          <p class="stat-label">2 ตัวล่าง</p>
          <p class="stat-value">{{ latestDraw.data.last2 }}</p>
        </div>
      </div>
    </section>

    <!-- ── Ticket Card ── -->
    <LoadingSkeleton v-if="pending" variant="ticket" />
    <ErrorCard v-else-if="error" message="โหลดข้อมูลไม่สำเร็จ" :on-retry="refresh" />
    <EmptyState v-else-if="!advisor" reason="no_data_in_range" :scope="filter.scope" />
    <LotteryTicketCard
      v-else
      :draw_date_next="advisor.draw_date_next"
      :suggestions="advisor.suggestions"
      :rationale="advisor.rationale"
      :scope="scopeLabel"
    />

    <!-- ── Quick Pick Card ── -->
    <template v-if="!pending && !error && advisor">
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Quick Pick</h2>
            <p class="card-subtitle">สุ่มเลขตามสถิติ — เลขค้างนานได้น้ำหนักมากกว่า</p>
          </div>
        </div>
        <div class="card-body">
          <div class="quickpick-actions">
            <button class="btn btn-gold" @click="generateQuickPick" :disabled="quickPickLoading">
              <span v-if="quickPickLoading">กำลังคำนวณ...</span>
              <span v-else>สุ่มเลขตามสถิติ</span>
            </button>
            <button class="btn btn-ghost btn-sm" @click="quickPick = null" v-if="quickPick && !quickPickLoading">รีเซ็ต</button>
          </div>
          <div v-if="quickPick" class="quickpick-result">
            <div class="quickpick-numbers">
              <div class="card quickpick-col">
                <p class="stat-label">2 ตัวล่าง</p>
                <p class="stat-value">{{ quickPick.last2 }}</p>
              </div>
              <div class="card quickpick-col">
                <p class="stat-label">3 ตัวล่าง</p>
                <p class="stat-value">{{ quickPick.last3b }}</p>
              </div>
              <div class="card quickpick-col">
                <p class="stat-label">3 ตัวหน้า</p>
                <p class="stat-value">{{ quickPick.last3f }}</p>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" @click="copyQuickPick">คัดลอกเลข</button>
          </div>
        </div>
      </div>

      <!-- ── Lookup Card ── -->
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">ค้นหาสถิติเลข</h2>
          </div>
        </div>
        <div class="card-body">
          <div class="lookup-row">
            <input
              v-model="lookupQuery"
              class="search-input focus-ring"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              placeholder="พิมพ์เลข 2–3 ตัว"
              maxlength="3"
              aria-label="ค้นหาสถิติเลข"
              @keydown.enter="doLookup"
              @input="validateNumericInput"
            />
            <button class="btn btn-gold" @click="doLookup" :disabled="lookupPending || lookupQuery.length < 2">
              {{ lookupPending ? "กำลังค้นหา..." : "ค้นหา" }}
            </button>
          </div>
          <div v-if="lookupResult" class="lookup-result">
            <div class="lookup-grid">
              <div class="card lookup-stat">
                <p class="stat-label">ออกทั้งหมด</p>
                <p class="stat-value num-mono">{{ lookupResult.count }} ครั้ง</p>
              </div>
              <div class="card lookup-stat">
                <p class="stat-label">อันดับ</p>
                <p class="stat-value num-mono">{{ lookupResult.rank }}/{{ lookupResult.total }}</p>
              </div>
              <div class="card lookup-stat">
                <p class="stat-label">ออกล่าสุด</p>
                <p class="stat-value num-mono">{{ lookupResult.last_draw || "—" }}</p>
              </div>
              <div class="card lookup-stat">
                <p class="stat-label">ค้างมา</p>
                <p class="stat-value num-mono">{{ lookupResult.gap === 999 ? "ไม่เคยออก" : `${lookupResult.gap} งวด` }}</p>
              </div>
            </div>
          </div>
          <EmptyState v-else-if="lookupQuery && !lookupPending" reason="no_search_result" />
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

.card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--gap-md);
  height: 100%;
}

.section-with-card {
  display: flex;
  flex-direction: column;
  gap: 0;
  height: 100%;
}

.advisor-grid-group {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gap-md);
}

@media (min-width: 1024px) {
  .advisor-grid-group {
    grid-template-columns: 1fr 1fr;
    align-items: stretch;
  }
}

.advisor-grid {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
  height: 100%;
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
  margin: 0;
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

/* Stats row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--gap-md);
}

@media (max-width: 600px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
}

/* Quick pick */
.quickpick-actions {
  display: flex;
  gap: var(--gap-sm);
  margin-bottom: var(--gap-md);
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
  padding: var(--gap-md);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap-xs);
  box-shadow: none;
  border: 1px solid var(--border);
}

/* Lookup */
.lookup-row {
  display: flex;
  gap: var(--gap-sm);
  margin-bottom: var(--gap-md);
}

.search-input {
  flex: 1;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: var(--gap-xs) var(--gap-sm);
  font-family: var(--font-body);
  font-size: var(--text-md);
  color: var(--text-primary);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.search-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(105, 108, 255, 0.15);
  outline: none;
}

.lookup-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--gap-sm);
}

.lookup-stat {
  padding: var(--gap-sm) var(--gap-md);
  box-shadow: none;
  border: 1px solid var(--border);
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
  font-size: var(--text-md);
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
