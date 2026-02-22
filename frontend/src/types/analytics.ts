export interface UsageStats {
  total_generations: number;
  total_training_hours: number;
  total_storage_mb: number;
  generations_this_month: number;
  voices_this_month: number;
}

export interface UsageTimeSeriesPoint {
  date: string;
  count: number;
  type: string;
}

export interface UsageTimeSeriesResponse {
  data: UsageTimeSeriesPoint[];
  period: string;
}
