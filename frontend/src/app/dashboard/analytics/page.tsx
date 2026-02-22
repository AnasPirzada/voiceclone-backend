"use client";

import { useAnalytics } from "@/hooks/use-analytics";

export default function AnalyticsPage() {
  const { stats, timeSeries, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          label="Total Generations"
          value={stats?.total_generations ?? 0}
          icon="🔊"
          color="from-blue-500/10 to-blue-600/10 border-blue-500/20"
        />
        <StatCard
          label="This Month"
          value={stats?.generations_this_month ?? 0}
          icon="📅"
          color="from-indigo-500/10 to-indigo-600/10 border-indigo-500/20"
        />
        <StatCard
          label="Voices Created"
          value={stats?.voices_this_month ?? 0}
          suffix=" this month"
          icon="🎤"
          color="from-purple-500/10 to-purple-600/10 border-purple-500/20"
        />
        <StatCard
          label="Training Hours"
          value={stats?.total_training_hours?.toFixed(1) ?? "0"}
          suffix="h"
          icon="⚙️"
          color="from-cyan-500/10 to-cyan-600/10 border-cyan-500/20"
        />
        <StatCard
          label="Storage Used"
          value={stats?.total_storage_mb ? `${stats.total_storage_mb.toFixed(1)}` : "0"}
          suffix=" MB"
          icon="💾"
          color="from-emerald-500/10 to-emerald-600/10 border-emerald-500/20"
        />
      </div>

      {/* Activity Chart */}
      <div className="border border-gray-700 rounded-xl p-6 bg-gray-900/50 mb-8">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-6">Activity ({timeSeries?.period || "30d"})</h2>

        {timeSeries?.data && timeSeries.data.length > 0 ? (
          <div className="space-y-2">
            {/* Simple bar chart */}
            <div className="flex items-end gap-1 h-40">
              {timeSeries.data.map((point, i) => {
                const maxCount = Math.max(...timeSeries.data.map((p) => p.count), 1);
                const height = (point.count / maxCount) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-gray-500">{point.count}</span>
                    <div
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        point.type === "generation"
                          ? "bg-gradient-to-t from-blue-600 to-blue-400"
                          : "bg-gradient-to-t from-purple-600 to-purple-400"
                      }`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 justify-center pt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-blue-500" />
                <span className="text-xs text-gray-400">Generations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-purple-500" />
                <span className="text-xs text-gray-400">Training</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            No activity data yet. Start generating voice audio to see your usage stats.
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="border border-gray-700 rounded-xl p-6 bg-gray-900/50">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Tips</h2>
        <div className="space-y-3 text-sm text-gray-400">
          <p>• Upload 5-30 seconds of clear speech for best voice cloning quality</p>
          <p>• Use WAV format for highest audio fidelity</p>
          <p>• Train with at least 100 epochs for natural-sounding results</p>
          <p>• All features are free — no limits on generations or voices</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  icon: string;
  color: string;
}) {
  return (
    <div className={`border rounded-xl p-4 bg-gradient-to-br ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-400">{label}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-white">
        {value}{suffix}
      </p>
    </div>
  );
}
