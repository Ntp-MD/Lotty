import type { StatsResponse, LatestDrawResponse } from "~/types";
import { computed } from "vue";

interface PanelPayload {
  stats2d: StatsResponse;
  stats3b: StatsResponse;
  stats3f: StatsResponse;
  latestDraw: LatestDrawResponse;
}

export const usePanelStats = async () => {
  // Hoist raw data ref before the single await
  const panelRaw = ref<PanelPayload | null>(null);

  // Hoist ALL computed before the await
  const latestDraw = computed(() => panelRaw.value?.latestDraw ?? null);

  const getGapForNumber = (number: string, stats: StatsResponse | null) => {
    if (!stats?.data?.ranking) return 0;
    const found = stats.data.ranking.find((r) => r.number === number);
    return found?.gap ?? 0;
  };

  const latestGaps = computed(() => {
    if (!latestDraw.value?.data) return null;
    return {
      last2: getGapForNumber(latestDraw.value.data.last2, panelRaw.value?.stats2d ?? null),
      last3b: getGapForNumber(latestDraw.value.data.last3b, panelRaw.value?.stats3b ?? null),
      last3f: getGapForNumber(latestDraw.value.data.last3f, panelRaw.value?.stats3f ?? null),
    };
  });

  const mostFrequent2d = computed(() => panelRaw.value?.stats2d?.data?.ranking[0] ?? null);
  const mostFrequent3b = computed(() => panelRaw.value?.stats3b?.data?.ranking[0] ?? null);
  const mostFrequent3f = computed(() => panelRaw.value?.stats3f?.data?.ranking[0] ?? null);

  const topDigits = computed(() => {
    const ranking = panelRaw.value?.stats2d?.data?.ranking;
    if (!ranking) return [];
    const digitFreq: Record<string, number> = {};
    ranking.forEach((r) => {
      const num = r.number;
      if (num.length >= 2) {
        digitFreq[num[0]] = (digitFreq[num[0]] || 0) + r.count;
        digitFreq[num[1]] = (digitFreq[num[1]] || 0) + r.count;
      }
    });
    return Object.entries(digitFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([digit, count]) => ({ digit, count }));
  });

  // Single await — one useAsyncData with parallel $fetch calls
  const { data } = await useAsyncData<PanelPayload>(
    "panel-stats",
    async () => {
      const [stats2d, stats3b, stats3f, latestDrawData] = await Promise.all([
        $fetch<StatsResponse>("/api/stats/2digit", { query: { scope: "all", type: "last2" } }),
        $fetch<StatsResponse>("/api/stats/3digit", { query: { scope: "all", type: "last3b" } }),
        $fetch<StatsResponse>("/api/stats/3digit", { query: { scope: "all", type: "last3f" } }),
        $fetch<LatestDrawResponse>("/api/latest-draw"),
      ]);
      return { stats2d, stats3b, stats3f, latestDraw: latestDrawData };
    }
  );

  panelRaw.value = data.value;

  watch(data, (newVal) => {
    if (newVal) panelRaw.value = newVal;
  });

  return { latestDraw, latestGaps, mostFrequent2d, mostFrequent3b, mostFrequent3f, topDigits };
};
