<script setup lang="ts">
import type { AdvisorResponse, StatsResponse, DigitsResponse, DigitPosition } from "~/types";
import { formatDate } from "~/composables/useDate";
import { useLanguage } from "~/composables/useLanguage";
import { onMounted, onUnmounted, ref, computed, watch } from "vue";

useHead({ title: "Recommended Numbers — Lotty" });

const { filter, scopeLabel } = useFilter();
const { t } = useLanguage();

// Hoist ALL data refs first (before any awaits)
const advisorData = ref<AdvisorResponse | null>(null);
const latestDrawData = ref<any>(null);
const digitsStatsData = ref<DigitsResponse | null>(null);

// Hoist ALL computed properties first (before any awaits)
const advisor = computed(() => advisorData.value?.data);
const latestDraw = computed(() => latestDrawData.value);
const positions = computed<DigitPosition[]>(() => digitsStatsData.value?.data ?? []);

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

const quickPick = ref<{ last2: string; last3b: string; last3f: string } | null>(null);
const quickPickLoading = ref(false);
const statsCache = ref<Record<string, { stats2: StatsResponse; stats3b: StatsResponse; stats3f: StatsResponse }>>({});

async function generateQuickPick() {
  quickPickLoading.value = true;
  try {
    const scope = filter.value.scope;
    let stats2: StatsResponse, stats3b: StatsResponse, stats3f: StatsResponse;

    if (statsCache.value[scope]) {
      ({ stats2, stats3b, stats3f } = statsCache.value[scope]);
    } else {
      [stats2, stats3b, stats3f] = await Promise.all([
        $fetch<StatsResponse>("/api/stats/2digit", { query: { scope, type: "last2" } }),
        $fetch<StatsResponse>("/api/stats/3digit", { query: { scope, type: "last3b" } }),
        $fetch<StatsResponse>("/api/stats/3digit", { query: { scope, type: "last3f" } }),
      ]);
      statsCache.value[scope] = { stats2, stats3b, stats3f };
    }

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

async function doLookup() {
  const q = lookupQuery.value.trim();
  if (q.length < 2 || q.length > 3) return;
  lookupPending.value = true;
  try {
    const res = await $fetch<{ data: typeof lookupResult.value }>("/api/stats/lookup", { query: { number: q, scope: filter.value.scope } });
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

const nextDrawDays = computed(() => {
  const now = new Date();
  const thaiTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  const next = new Date(thaiTime);
  if (thaiTime.getDate() < 16) {
    next.setDate(16);
  } else {
    next.setMonth(thaiTime.getMonth() + 1, 1);
  }
  next.setHours(0, 0, 0, 0);
  const today = new Date(thaiTime);
  today.setHours(0, 0, 0, 0);
  return Math.round((next.getTime() - today.getTime()) / 86400000);
});

const countdown = ref({ hours: 0, minutes: 0, seconds: 0 });
const isDrawDay = computed(() => {
  const now = new Date();
  const thaiTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  const day = thaiTime.getDate();
  return day === 1 || day === 16;
});

function getThaiDateString() {
  const now = new Date();
  const thaiTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  const y = thaiTime.getFullYear();
  const m = String(thaiTime.getMonth() + 1).padStart(2, '0');
  const d = String(thaiTime.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Run unified async fetch last (top-level await at the very bottom of setup)
const asyncKeyHome = computed(() => `home-${filter.value.scope}`);
const { data: homeFetchedData, pending, error, refresh } = await useAsyncData(
  asyncKeyHome.value,
  async () => {
    const [adv, latest, digits] = await Promise.all([
      $fetch<AdvisorResponse>("/api/advisor", { query: { scope: filter.value.scope } }),
      $fetch<any>("/api/latest-draw"),
      $fetch<DigitsResponse>("/api/stats/digits", { query: { scope: filter.value.scope } }),
    ]);
    return { advisor: adv, latestDraw: latest, digitsData: digits };
  },
  { watch: [asyncKeyHome] }
);

// Populate our hoisted refs
advisorData.value = (homeFetchedData.value?.advisor ?? null) as AdvisorResponse | null;
latestDrawData.value = (homeFetchedData.value?.latestDraw ?? null) as any;
digitsStatsData.value = (homeFetchedData.value?.digitsData ?? null) as DigitsResponse | null;

watch(homeFetchedData, (newVal) => {
  if (newVal) {
    advisorData.value = (newVal.advisor ?? null) as AdvisorResponse | null;
    latestDrawData.value = (newVal.latestDraw ?? null) as any;
    digitsStatsData.value = (newVal.digitsData ?? null) as DigitsResponse | null;
  }
});

const latestDrawPending = pending;
const digitsPending = pending;
const digitsError = error;

const refreshLatestDraw = refresh;
const refreshDigits = refresh;

let pollingInterval: ReturnType<typeof setInterval> | null = null;

function startPollingIfNeeded() {
  if (!isDrawDay.value) return;

  const now = new Date();
  const thaiTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  const currentMinutes = thaiTime.getHours() * 60 + thaiTime.getMinutes();

  // Draw announcement is at ~15:58 - 16:05
  // Start polling from 15:50 to 16:30 Thailand time
  const startPollingMinutes = 15 * 60 + 50; // 15:50
  const stopPollingMinutes = 16 * 60 + 30;  // 16:30

  const todayStr = getThaiDateString();

  if (latestDraw.value?.data?.draw_date === todayStr) {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    return;
  }

  if (currentMinutes >= startPollingMinutes && currentMinutes <= stopPollingMinutes) {
    if (!pollingInterval) {
      pollingInterval = setInterval(async () => {
        await refreshLatestDraw();
        if (latestDraw.value?.data?.draw_date === getThaiDateString()) {
          // New draw is found! Refresh all stats on the page dynamically
          refresh();
          if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
          }
        }
      }, 15000); // Poll every 15 seconds
    }
  } else {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  }
}

function updateCountdown() {
  const now = new Date();
  const thaiTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  const nextDraw = new Date(thaiTime);
  
  if (thaiTime.getDate() < 16) {
    nextDraw.setDate(16);
  } else if (thaiTime.getDate() === 16 && thaiTime.getHours() < 16) {
    nextDraw.setDate(16);
  } else if (thaiTime.getDate() === 16 && thaiTime.getHours() >= 16) {
    nextDraw.setMonth(thaiTime.getMonth() + 1, 1);
  } else {
    nextDraw.setMonth(thaiTime.getMonth() + 1, 1);
  }
  nextDraw.setHours(16, 0, 0, 0);
  
  const diff = nextDraw.getTime() - thaiTime.getTime();
  if (diff > 0) {
    countdown.value = {
      hours: Math.floor(diff / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  } else {
    countdown.value = { hours: 0, minutes: 0, seconds: 0 };
  }

  startPollingIfNeeded();
}

let countdownInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
});

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
  if (pollingInterval) clearInterval(pollingInterval);
});
</script>

<template>
  <div class="page-content">
    <FilterBar />

    <section v-if="latestDraw?.data" class="hero">
      <div class="hero-top">
        <div class="hero-heading">
          <span class="hero-eyebrow">{{ t('results.latest') }}</span>
          <span class="hero-date">{{ formatDate(latestDraw.data.draw_date) }}</span>
        </div>
        <div class="hero-countdown">
          <span class="hero-countdown-label">{{ isDrawDay ? t('hero.today') : t('hero.nextDraw') }}</span>
          <span v-if="!isDrawDay && nextDrawDays > 0" class="hero-countdown-value">{{ nextDrawDays }} {{ t('hero.days') }}</span>
          <div v-else-if="isDrawDay" class="hero-countdown-timer">
            <span class="timer-unit">{{ String(countdown.hours).padStart(2, '0') }}{{ t('hero.hours') }}</span>:
            <span class="timer-unit">{{ String(countdown.minutes).padStart(2, '0') }}{{ t('hero.minutes') }}</span>:
            <span class="timer-unit">{{ String(countdown.seconds).padStart(2, '0') }}{{ t('hero.seconds') }}</span>
          </div>
        </div>
      </div>
      <div class="hero-first">
        <span class="hero-first-label">{{ t('results.firstPrize') }}</span>
        <div class="hero-digits">
          <span
            v-for="(d, i) in latestDraw.data.first.split('')"
            :key="i"
            class="hero-digit num-display"
            :style="{ animationDelay: `${Number(i) * 90}ms` }"
          >{{ d }}</span>
        </div>
      </div>
      <div class="hero-minor">
        <div class="hero-minor-col">
          <span class="hero-minor-label">{{ t('results.last3f') }}</span>
          <span class="num-display hero-minor-number">{{ latestDraw.data.last3f }}</span>
        </div>
        <div class="hero-minor-col">
          <span class="hero-minor-label">{{ t('results.last3b') }}</span>
          <span class="num-display hero-minor-number">{{ latestDraw.data.last3b }}</span>
        </div>
        <div class="hero-minor-col">
          <span class="hero-minor-label">{{ t('results.last2') }}</span>
          <span class="num-display hero-minor-number">{{ latestDraw.data.last2 }}</span>
        </div>
      </div>
    </section>

    <h1 class="section-title">{{ t('title.recommend') }}</h1>

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

      <h2 class="section-title section-title-sub">{{ t('quickpick.title') }} & {{ t('lookup.title') }}</h2>
      <div class="card">
          <div class="tools-section">
            <div class="tools-row">
              <div class="tool-block">
                <h3 class="tool-title">{{ t('quickpick.title') }}</h3>
                <p style="font-size: var(--text-sm); color: var(--text-secondary)">
                  {{ t('quickpick.desc') }}
                </p>
                <div class="quickpick-actions">
                  <button class="btn btn-gold" @click="generateQuickPick" :disabled="quickPickLoading">
                    <span v-if="quickPickLoading">{{ t('quickpick.calculating') }}</span>
                    <span v-else>{{ t('quickpick.random') }}</span>
                  </button>
                  <button class="btn btn-ghost" @click="quickPick = null" v-if="quickPick && !quickPickLoading">{{ t('quickpick.reset') }}</button>
                </div>
                <div v-if="quickPick" class="quickpick-result">
                  <div class="quickpick-numbers">
                    <div class="quickpick-col">
                      <span class="quickpick-label">{{ t('results.last2') }}</span>
                      <span class="num-display quickpick-num">{{ quickPick.last2 }}</span>
                    </div>
                    <div class="quickpick-col">
                      <span class="quickpick-label">{{ t('results.last3b') }}</span>
                      <span class="num-display quickpick-num">{{ quickPick.last3b }}</span>
                    </div>
                    <div class="quickpick-col">
                      <span class="quickpick-label">{{ t('results.last3f') }}</span>
                      <span class="num-display quickpick-num">{{ quickPick.last3f }}</span>
                    </div>
                  </div>
                  <button class="btn btn-sm btn-ghost" @click="copyQuickPick">
                    {{ t('quickpick.copy') }}
                  </button>
                </div>
              </div>

              <div class="divider-v"></div>

              <div class="tool-block">
                <h3 class="tool-title">{{ t('lookup.title') }}</h3>
                <div class="lookup-row">
                  <input
                    v-model="lookupQuery"
                    class="search-input focus-ring"
                    type="text"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    :placeholder="t('lookup.placeholder')"
                    maxlength="3"
                    :aria-label="t('lookup.aria')"
                    @keydown.enter="doLookup"
                    @input="validateNumericInput"
                  />
                  <button class="btn btn-gold" @click="doLookup" :disabled="lookupPending || lookupQuery.length < 2">
                    {{ lookupPending ? t('lookup.searching') : t('lookup.search') }}
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
                      <span class="lookup-key">{{ t('lookup.totalAppeared') }}</span><span class="num-mono">{{ lookupResult.count }} {{ t('lookup.times') }}</span>
                    </div>
                    <div>
                      <span class="lookup-key">{{ t('lookup.rank') }}</span><span class="num-mono">{{ lookupResult.rank }} / {{ lookupResult.total }}</span>
                    </div>
                    <div>
                      <span class="lookup-key">{{ t('lookup.latest') }}</span><span class="num-mono">{{ lookupResult.last_draw || "—" }}</span>
                    </div>
                    <div>
                      <span class="lookup-key">{{ t('lookup.gap') }}</span
                      ><span class="num-mono">{{ lookupResult.gap === 999 ? t('lookup.never') : `${lookupResult.gap} ${t('lookup.draws')}` }}</span>
                    </div>
                  </div>
                </div>
                <EmptyState v-else-if="lookupQuery && !lookupPending" reason="no_search_result" />
              </div>
            </div>

            <hr class="divider-dashed" />

            <div class="tool-block combo-block">
              <details class="combo-collapse">
              <summary class="combo-summary">
                <span class="tool-title">{{ t('combo.title') }}</span>
                <span class="combo-summary-hint">{{ t('combo.hintOpen') }}</span>
              </summary>
              <p class="combo-hint">{{ t('combo.hint') }}</p>
              <div class="combo-locks">
                <div v-for="pos in positions" :key="pos.position" class="combo-pos">
                  <span class="combo-pos-label">{{ t('combo.position') }} {{ pos.position }}</span>
                  <div class="combo-digits">
                    <button
                      v-for="d in 10"
                      :key="d - 1"
                      class="combo-digit-btn focus-ring"
                      :class="{ 'combo-digit-locked': locks[pos.position] === String(d - 1) }"
                      @click="toggleLock(pos.position, String(d - 1))"
                      :aria-pressed="locks[pos.position] === String(d - 1)"
                      :aria-label="t('combo.lockAria', { pos: pos.position, digit: d - 1 })"
                    >
                      {{ d - 1 }}
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="comboFreq !== null" class="combo-result">
                <span class="combo-result-label">{{ t('combo.frequency') }}</span>
                <span class="num-display combo-result-val">{{ comboFreq }}%</span>
              </div>
              </details>
            </div>
          </div>
      </div>

      <h2 class="section-title section-title-sub">{{ t('breakdown.title6d') }}</h2>

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
    </template>
  </div>
</template>

<style scoped>
.section-title-sub {
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  color: var(--text-secondary);
  letter-spacing: 0;
  text-transform: none;
}

.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--gap-lg);
  padding: var(--gap-xl) var(--gap-lg);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-card);
  color: var(--text-primary);
}


.hero-top {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--gap-md);
  flex-wrap: wrap;
}

.hero-heading {
  display: flex;
  flex-direction: column;
  gap: var(--gap-xs);
}

.hero-eyebrow {
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
  letter-spacing: -0.3px;
  color: var(--text-primary);
}

.hero-date {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.hero-countdown {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  padding: var(--gap-sm) var(--gap-md);
  border-radius: var(--radius-md);
  background: var(--accent-gold-light);
}

.hero-countdown-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.hero-countdown-value {
  font-size: var(--text-md);
  font-weight: var(--weight-bold);
  color: var(--accent-gold);
}

.hero-countdown-timer {
  display: flex;
  align-items: center;
  gap: 2px;
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
  color: var(--accent-gold);
}

.timer-unit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2ch;
}

.hero-first {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap-sm);
}

.hero-first-label {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--text-muted);
  font-weight: var(--weight-semibold);
}

.hero-digits {
  display: flex;
  gap: var(--gap-xs);
  flex-wrap: nowrap;
  justify-content: center;
}

.hero-digit {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: clamp(44px, 7vw, 64px);
  min-height: clamp(56px, 9vw, 80px);
  font-size: clamp(28px, 5vw, 44px);
  font-weight: var(--weight-bold);
  border-radius: var(--radius-sm);
  background: var(--accent-light);
  color: var(--accent);
  animation: hero-digit-in 0.55s cubic-bezier(0.2, 0.8, 0.3, 1.15) both;
}

@keyframes hero-digit-in {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.85);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.hero-minor {
  position: relative;
  display: flex;
  gap: var(--gap-sm);
  flex-wrap: wrap;
}

.hero-minor-col {
  flex: 1;
  min-width: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap-xs);
  padding: var(--gap-md);
  border-radius: var(--radius-md);
  background: var(--bg-raised);
  border: 1px solid var(--border);
  transition: transform var(--transition-fast), border-color var(--transition-fast);
}

.hero-minor-col:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
}

.hero-minor-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.hero-minor-number {
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
  letter-spacing: 2px;
  color: var(--accent);
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

.tool-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm);
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

.divider-v {
  display: none;
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
  grid-template-columns: 1fr;
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
  flex-wrap: wrap;
}
.lookup-number {
  font-size: var(--text-xl);
}
.lookup-grid {
  display: grid;
  grid-template-columns: 1fr;
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
  min-width: var(--nav-link-height);
  min-height: var(--nav-link-height);
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
  color: var(--text-primary);
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

/* ── Responsive Breakpoints (Mobile-First) ── */
@media (max-width: 480px) {
  .hero-top {
    flex-direction: column;
  }
  .hero-countdown {
    align-items: flex-start;
  }
  .hero-digits {
    gap: var(--gap-xs);
  }
  .combo-digits {
    gap: 2px;
  }
  .combo-digit-btn {
    min-width: 28px;
    min-height: 28px;
    font-size: var(--text-xs);
  }
}

@media (min-width: 480px) {
  .quickpick-numbers {
    grid-template-columns: repeat(3, 1fr);
  }
  .lookup-grid {
    grid-template-columns: 1fr 1fr;
  }
  .combo-digits {
    gap: var(--gap-xs);
  }
}

@media (min-width: 768px) {
  .tools-row {
    flex-direction: row;
  }
  .divider-v {
    display: block;
    width: 1px;
    background: var(--border);
  }
}

@media (min-width: 1024px) {
  .tool-block {
    height: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-digit {
    animation: none;
  }
}
</style>
