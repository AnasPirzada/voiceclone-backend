import apiClient from "./client";
import { UsageStats, UsageTimeSeriesResponse } from "@/types/analytics";

export const analyticsApi = {
  getUsageStats: () =>
    apiClient.get<UsageStats>("/analytics/usage").then((r) => r.data),

  getTimeSeries: (period: "7d" | "30d" | "90d" | "1y" = "30d") =>
    apiClient.get<UsageTimeSeriesResponse>("/analytics/usage/timeseries", { params: { period } }).then((r) => r.data),
};
