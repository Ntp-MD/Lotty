import type { StatsResponse } from "~/types";

interface LatestDrawResponse {
  data: {
    draw_date: string;
    first: string;
    last2: string;
    last3f: string;
    last3b: string;
  } | null;
}

export const usePanelStats = async () => {
  const { data: stats2d } = await useFetch<StatsResponse>("/api/stats/2digit", {
    query: { scope: "all", type: "last2" }
  });

  const { data: stats3b } = await useFetch<StatsResponse>("/api/stats/3digit", {
    query: { scope: "all", type: "last3b" }
  });

  const { data: stats3f } = await useFetch<StatsResponse>("/api/stats/3digit", {
    query: { scope: "all", type: "last3f" }
  });

  const { data: latestDraw } = await useFetch<LatestDrawResponse>("/api/latest-draw");

  const getGapForNumber = (number: string, stats: any) => {
    if (!stats?.data?.ranking) return 0;
    const found = stats.data.ranking.find((r: any) => r.number === number);
    return found?.gap ?? 0;
  };

  const getGapClass = (gap: number) => {
    if (gap >= 10) return "gap-hot";
    if (gap >= 5) return "gap-warm";
    return "gap-normal";
  };

  const latestGaps = computed(() => {
    if (!latestDraw.value?.data) return null;
    return {
      last2: getGapForNumber(latestDraw.value.data.last2, stats2d.value),
      last3b: getGapForNumber(latestDraw.value.data.last3b, stats3b.value),
      last3f: getGapForNumber(latestDraw.value.data.last3f, stats3f.value),
    };
  });

  const mostFrequent2d = computed(() => {
    if (!stats2d.value?.data?.ranking) return null;
    return stats2d.value.data.ranking[0];
  });

  const mostFrequent3b = computed(() => {
    if (!stats3b.value?.data?.ranking) return null;
    return stats3b.value.data.ranking[0];
  });

  const mostFrequent3f = computed(() => {
    if (!stats3f.value?.data?.ranking) return null;
    return stats3f.value.data.ranking[0];
  });

  const topDigits = computed(() => {
    if (!stats2d.value?.data?.ranking) return [];
    const digitFreq: Record<string, number> = {};
    stats2d.value.data.ranking.forEach((r: any) => {
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

  return { latestDraw, latestGaps, getGapClass, mostFrequent2d, mostFrequent3b, mostFrequent3f, topDigits };
};
