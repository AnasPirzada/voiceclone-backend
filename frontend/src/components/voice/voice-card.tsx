"use client";

import { VoiceProfile } from "@/types/voice";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";

interface VoiceCardProps {
  voice: VoiceProfile;
  onDelete?: (id: string) => void;
}

export function VoiceCard({ voice, onDelete }: VoiceCardProps) {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-900/30 text-yellow-400 border-yellow-500/20",
    processing: "bg-blue-900/30 text-blue-400 border-blue-500/20",
    trained: "bg-green-900/30 text-green-400 border-green-500/20",
    failed: "bg-red-900/30 text-red-400 border-red-500/20",
  };

  return (
    <div className="border border-gray-700 rounded-xl p-4 bg-gray-900/50 hover:border-gray-600 transition-all duration-200 group">
      <div className="flex items-center justify-between mb-2">
        <Link href={`/dashboard/voices/${voice.id}`} className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
          {voice.name}
        </Link>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${statusColors[voice.status] || "bg-gray-800 text-gray-400"}`}>
          {voice.status}
        </span>
      </div>
      {voice.description && <p className="text-sm text-gray-400 mb-3">{voice.description}</p>}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{voice.sample_count} sample{voice.sample_count !== 1 ? "s" : ""}</span>
        <span>{voice.total_duration_seconds.toFixed(1)}s</span>
        <span className="uppercase">{voice.language}</span>
        <span>{formatDate(voice.created_at)}</span>
      </div>
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-800">
        <Link
          href={`/dashboard/voices/${voice.id}`}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          View Details
        </Link>
        {voice.status === "trained" && (
          <Link
            href="/studio"
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Use in Studio
          </Link>
        )}
        {voice.status === "pending" && voice.sample_count > 0 && (
          <Link
            href={`/dashboard/voices/${voice.id}/train`}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            Train
          </Link>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(voice.id)}
            className="text-xs text-red-400/60 hover:text-red-400 ml-auto transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
