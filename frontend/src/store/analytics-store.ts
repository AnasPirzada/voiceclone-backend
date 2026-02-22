import { create } from "zustand";
import { UsageStats, UsageTimeSeriesResponse } from "@/types/analytics";
import { analyticsApi } from "@/lib/api/analytics";

interface AnalyticsStore {
  stats: UsageStats | null;
  timeSeries: UsageTimeSeriesResponse | null;
  isLoading: boolean;
  fetchStats: () => Promise<void>;
  fetchTimeSeries: (period?: "7d" | "30d" | "90d" | "1y") => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  stats: null,
  timeSeries: null,
  isLoading: false,

  fetchStats: async () => {
    set({ isLoading: true });
    try {
      const stats = await analyticsApi.getUsageStats();
      set({ stats });
    } catch {
      // Silently handle errors (e.g., not authenticated)
      set({ stats: null });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTimeSeries: async (period = "30d") => {
    try {
      const timeSeries = await analyticsApi.getTimeSeries(period);
      set({ timeSeries });
    } catch {
      set({ timeSeries: null });
    }
  },
}));
