import { useEffect } from "react";
import { useAnalyticsStore } from "@/store/analytics-store";

export function useAnalytics() {
  const { stats, timeSeries, isLoading, fetchStats, fetchTimeSeries } = useAnalyticsStore();

  useEffect(() => {
    fetchStats();
    fetchTimeSeries();
  }, [fetchStats, fetchTimeSeries]);

  return { stats, timeSeries, isLoading, fetchStats, fetchTimeSeries };
}
