"use client";

import { useVoices } from "@/hooks/use-voices";
import { VoiceList } from "@/components/voice/voice-list";
import Link from "next/link";

export default function VoicesPage() {
  const { voices, isLoading, deleteVoice } = useVoices();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Voices</h1>
          <p className="text-sm text-gray-400 mt-1">{voices.length} voice profile{voices.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/dashboard/voices/create"
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
        >
          + Create Voice
        </Link>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <VoiceList voices={voices} onDelete={deleteVoice} />
      )}
    </div>
  );
}
