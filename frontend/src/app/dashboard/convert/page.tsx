"use client";

import { useState } from "react";
import { useVoices } from "@/hooks/use-voices";
import { useJobPolling } from "@/hooks/use-jobs";
import { ConversionForm } from "@/components/generation/conversion-form";
import { Player } from "@/components/audio/player";
import { generationApi } from "@/lib/api/generation";
import { GenerationStatusResponse } from "@/types/api";
import { getErrorMessage } from "@/lib/utils/error-handler";

export default function ConvertPage() {
  const { voices } = useVoices();
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trainedVoices = voices.filter((v) => v.status === "trained");

  useJobPolling(jobId, async (status) => {
    if (status === "completed" && jobId) {
      const res = await generationApi.getConversionStatus(jobId);
      setResult(res);
      setJobId(null);
    }
    if (status === "failed") {
      setError("Conversion failed. Please try again.");
      setJobId(null);
    }
  });

  const handleConvert = async (voiceId: string, file: File, options: { language: string; pitch_shift: number; emotion: string | null }) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await generationApi.convertVoice(
        { voice_profile_id: voiceId, language: options.language, pitch_shift: options.pitch_shift, emotion: options.emotion },
        file
      );
      setJobId(response.job_id);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2 text-white">Voice-to-Voice Conversion</h1>
      <p className="text-sm text-gray-400 mb-6">Upload audio and convert it to your cloned voice.</p>

      <ConversionForm voices={trainedVoices} onSubmit={handleConvert} isLoading={isLoading || !!jobId} />

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {jobId && (
        <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-400" />
            <p className="text-sm text-indigo-400">Converting audio... This may take a moment.</p>
          </div>
        </div>
      )}

      {result?.output_audio_url && (
        <div className="mt-6">
          <Player url={result.output_audio_url} title="Converted Audio" />
        </div>
      )}
    </div>
  );
}
