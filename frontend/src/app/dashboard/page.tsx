"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useVoiceStore } from "@/store/voice-store";
import { useJobStore } from "@/store/job-store";
import { useAnalytics } from "@/hooks/use-analytics";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { voices, fetchVoices } = useVoiceStore();
  const { activeJobs, fetchJobs } = useJobStore();
  const { stats } = useAnalytics();

  useEffect(() => {
    fetchVoices();
    fetchJobs();
  }, [fetchVoices, fetchJobs]);

  const trainedVoices = voices.filter((v) => v.status === "trained");
  const pendingVoices = voices.filter((v) => v.status === "pending");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2 text-white">
        Welcome back, {user?.full_name || "User"}
      </h1>
      <p className="text-sm text-gray-400 mb-8">Here's an overview of your voice cloning workspace.</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="border border-gray-700 rounded-xl p-5 bg-gradient-to-br from-blue-500/10 to-blue-600/10">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Voices</p>
          <p className="text-3xl font-bold text-white">{voices.length}</p>
          <p className="text-[10px] text-blue-400 mt-1">
            {trainedVoices.length} trained · {pendingVoices.length} pending
          </p>
        </div>
        <div className="border border-gray-700 rounded-xl p-5 bg-gradient-to-br from-indigo-500/10 to-indigo-600/10">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Active Jobs</p>
          <p className="text-3xl font-bold text-white">{activeJobs.length}</p>
          <p className="text-[10px] text-indigo-400 mt-1">Training & generation</p>
        </div>
        <div className="border border-gray-700 rounded-xl p-5 bg-gradient-to-br from-purple-500/10 to-purple-600/10">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Generations</p>
          <p className="text-3xl font-bold text-white">{stats?.generations_this_month ?? 0}</p>
          <p className="text-[10px] text-purple-400 mt-1">This month</p>
        </div>
        <div className="border border-gray-700 rounded-xl p-5 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Storage</p>
          <p className="text-3xl font-bold text-white">
            {stats?.total_storage_mb ? `${stats.total_storage_mb.toFixed(1)}` : "0"}
          </p>
          <p className="text-[10px] text-emerald-400 mt-1">MB used</p>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/dashboard/voices/create"
          className="flex items-center gap-4 p-5 border border-gray-700 rounded-xl bg-gray-900/50 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            🎤
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Create New Voice</p>
            <p className="text-xs text-gray-500">Upload samples & train a voice clone</p>
          </div>
        </Link>

        <Link
          href="/studio"
          className="flex items-center gap-4 p-5 border border-gray-700 rounded-xl bg-gray-900/50 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            🎙️
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Open Studio</p>
            <p className="text-xs text-gray-500">Generate speech with your cloned voice</p>
          </div>
        </Link>

        <Link
          href="/dashboard/analytics"
          className="flex items-center gap-4 p-5 border border-gray-700 rounded-xl bg-gray-900/50 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            📈
          </div>
          <div>
            <p className="text-sm font-semibold text-white">View Analytics</p>
            <p className="text-xs text-gray-500">Track your usage & activity</p>
          </div>
        </Link>
      </div>

      {/* Recent Voices */}
      {voices.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Recent Voices</h2>
            <Link href="/dashboard/voices" className="text-xs text-indigo-400 hover:text-indigo-300">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {voices.slice(0, 3).map((voice) => (
              <Link
                key={voice.id}
                href={`/dashboard/voices/${voice.id}`}
                className="border border-gray-700 rounded-xl p-4 bg-gray-900/50 hover:border-gray-600 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-white">{voice.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                    voice.status === "trained"
                      ? "bg-green-900/30 text-green-400"
                      : voice.status === "processing"
                      ? "bg-blue-900/30 text-blue-400"
                      : "bg-yellow-900/30 text-yellow-400"
                  }`}>
                    {voice.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {voice.sample_count} samples · {voice.total_duration_seconds.toFixed(1)}s · {voice.language.toUpperCase()}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}

      {voices.length === 0 && (
        <div className="text-center py-12 border border-dashed border-gray-700 rounded-xl bg-gray-900/30">
          <p className="text-4xl mb-3">🎤</p>
          <p className="text-lg font-semibold text-gray-300 mb-1">No voices yet</p>
          <p className="text-sm text-gray-500 mb-4">Create your first voice clone to get started</p>
          <Link
            href="/dashboard/voices/create"
            className="inline-flex px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            Create Your First Voice
          </Link>
        </div>
      )}
    </div>
  );
}
