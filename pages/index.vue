<script setup lang="ts">
import type { AdvisorResponse, StatsResponse } from "~/types";

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
</script>

<template>
  <div>
    <FilterBar />
    <h1 class="section-title" style="margin-top: var(--gap-md)">เลขแนะนำ</h1>

    <LoadingSkeleton v-if="pending" variant="ticket" />
    <ErrorCard v-else-if="error" message="โหลดข้อมูลไม่สำเร็จ" :on-retry="refresh" />
    <EmptyState v-else-if="!advisor" reason="no_data_in_range" :scope="filter.scope" />
    <template v-else>
      <LotteryTicketCard
        :draw_date_next="advisor.draw_date_next"
        :suggestions="advisor.suggestions"
        :rationale="advisor.rationale"
        :scope="scopeLabel"
      />

      <section class="card card-elevated" style="margin-top: var(--gap-lg)">
        <h2 class="section-title">🎲 Quick Pick</h2>
        <p style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--gap-sm)">
          สุ่มเลขตามสถิติ — เลขที่ค้างนานได้น้ำหนักมากกว่า
        </p>
        <div class="quickpick-actions">
          <button class="btn btn-gold" @click="generateQuickPick" :disabled="quickPickLoading">
            {{ quickPickLoading ? "กำลังสุ่ม..." : "สุ่มเลขตามสถิติ" }}
          </button>
          <button class="btn btn-ghost" @click="quickPick = null" v-if="quickPick && !quickPickLoading">รีเซ็ต</button>
        </div>
        <div v-if="quickPick" class="quickpick-result">
          <div class="quickpick-row">
            <span class="quickpick-label">2 ตัวล่าง</span>
            <span class="num-display quickpick-num">{{ quickPick.last2 }}</span>
          </div>
          <div class="quickpick-row">
            <span class="quickpick-label">3 ตัวล่าง</span>
            <span class="num-display quickpick-num">{{ quickPick.last3b }}</span>
          </div>
          <div class="quickpick-row">
            <span class="quickpick-label">3 ตัวหน้า</span>
            <span class="num-display quickpick-num">{{ quickPick.last3f }}</span>
          </div>
        </div>
      </section>

      <section class="card card-elevated" style="margin-top: var(--gap-lg)">
        <h2 class="section-title">🔍 ค้นหาสถิติเลข</h2>
        <div class="lookup-row">
          <input
            v-model="lookupQuery"
            class="search-input focus-ring"
            type="text"
            placeholder="พิมพ์เลข 2–3 ตัว"
            maxlength="3"
            aria-label="ค้นหาสถิติเลข"
            @keydown.enter="doLookup"
          />
          <button class="btn btn-gold" @click="doLookup" :disabled="lookupPending">
            {{ lookupPending ? "กำลังค้นหา..." : "ค้นหา" }}
          </button>
        </div>
        <div v-if="lookupResult" class="lookup-result card" style="margin-top: var(--gap-sm)">
          <div
            class="num-display lookup-number"
            :class="{ 'badge-hot': lookupResult.label === 'ออกบ่อย', 'badge-cold': lookupResult.label === 'ไม่เคยออก' }"
          >
            {{ lookupResult.number }}
          </div>
          <div class="lookup-grid">
            <div>
              <span class="lookup-key">ออกทั้งหมด</span><span class="num-mono">{{ lookupResult.count }} ครั้ง</span>
            </div>
            <div>
              <span class="lookup-key">อันดับ</span><span class="num-mono">{{ lookupResult.rank }} / {{ lookupResult.total }}</span>
            </div>
            <div>
              <span class="lookup-key">ล่าสุด</span><span class="num-mono">{{ lookupResult.last_draw || "—" }}</span>
            </div>
            <div>
              <span class="lookup-key">ค้างมา</span
              ><span class="num-mono">{{ lookupResult.gap === 999 ? "ไม่เคยออก" : `${lookupResult.gap} งวด` }}</span>
            </div>
          </div>
        </div>
        <EmptyState v-else-if="lookupQuery && !lookupPending" reason="no_search_result" />
      </section>
    </template>

    <DisclaimerBanner />
  </div>
</template>

<style scoped>
.quickpick-actions {
  display: flex;
  gap: var(--gap-sm);
}
.quickpick-result {
  margin-top: var(--gap-md);
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm);
}
.quickpick-row {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
}
.quickpick-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  min-width: 70px;
}
.quickpick-num {
  color: var(--accent-gold);
  letter-spacing: 4px;
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
  max-width: 200px;
  flex: 1;
}

.lookup-number {
  font-size: var(--text-xl);
  margin-bottom: var(--gap-sm);
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
</style>
