"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { voicesApi } from "@/lib/api/voices";
import { VoiceProfile } from "@/types/voice";
import { getErrorMessage } from "@/lib/utils/error-handler";

export default function VoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const voiceId = params.id as string;
  const [voice, setVoice] = useState<VoiceProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVoice() {
      try {
        const data = await voicesApi.get(voiceId);
        setVoice(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }
    fetchVoice();
  }, [voiceId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error || !voice) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || "Voice not found"}</p>
        <Link href="/dashboard/voices" className="text-indigo-600 hover:underline">
          Back to Voices
        </Link>
      </div>
    );
  }

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    trained: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  }[voice.status] || "bg-gray-100 text-gray-800";

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/dashboard/voices" className="text-sm text-gray-400 hover:text-white mb-2 block">
            ← Back to Voices
          </Link>
          <h1 className="text-2xl font-bold">{voice.name}</h1>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColor}`}>
          {voice.status}
        </span>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border border-gray-700 rounded-xl p-4 bg-gray-900/50">
          <p className="text-xs text-gray-400 mb-1">Samples</p>
          <p className="text-2xl font-bold text-white">{voice.sample_count}</p>
        </div>
        <div className="border border-gray-700 rounded-xl p-4 bg-gray-900/50">
          <p className="text-xs text-gray-400 mb-1">Total Duration</p>
          <p className="text-2xl font-bold text-white">{voice.total_duration_seconds.toFixed(1)}s</p>
        </div>
        <div className="border border-gray-700 rounded-xl p-4 bg-gray-900/50">
          <p className="text-xs text-gray-400 mb-1">Language</p>
          <p className="text-2xl font-bold text-white uppercase">{voice.language}</p>
        </div>
      </div>

      {/* Description */}
      {voice.description && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h2>
          <p className="text-gray-300 text-sm">{voice.description}</p>
        </div>
      )}

      {/* Details */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">Created</span>
            <span className="text-gray-200">{new Date(voice.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">Last Updated</span>
            <span className="text-gray-200">{new Date(voice.updated_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">Voice ID</span>
            <span className="text-gray-200 font-mono text-xs">{voice.id}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        {voice.status === "pending" && voice.sample_count > 0 && (
          <Link
            href={`/dashboard/voices/${voiceId}/train`}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            Train Voice Model
          </Link>
        )}
        {voice.status === "trained" && (
          <>
            <Link
              href="/studio"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all"
            >
              Use in Studio
            </Link>
            <Link
              href="/dashboard/generate"
              className="px-6 py-2.5 border border-gray-600 text-gray-300 rounded-lg font-medium hover:border-gray-500 hover:text-white transition-all"
            >
              Generate Speech
            </Link>
          </>
        )}
        {voice.status === "failed" && (
          <Link
            href={`/dashboard/voices/${voiceId}/train`}
            className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all"
          >
            Retry Training
          </Link>
        )}
        <Link
          href={`/dashboard/voices/${voiceId}/edit`}
          className="px-6 py-2.5 border border-gray-600 text-gray-300 rounded-lg font-medium hover:border-gray-500 hover:text-white transition-all"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}
