"use client";

import { useState } from "react";
import { useVoices } from "@/hooks/use-voices";
import { useJobPolling } from "@/hooks/use-jobs";
import { TTSForm } from "@/components/generation/tts-form";
import { Player } from "@/components/audio/player";
import { generationApi } from "@/lib/api/generation";
import { TTSRequest, GenerationStatusResponse } from "@/types/api";
import { getErrorMessage } from "@/lib/utils/error-handler";

export default function GeneratePage() {
  const { voices } = useVoices();
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trainedVoices = voices.filter((v) => v.status === "trained");

  useJobPolling(jobId, async (status) => {
    if (status === "completed" && jobId) {
      const res = await generationApi.getTTSStatus(jobId);
      setResult(res);
      setJobId(null);
    }
    if (status === "failed") {
      setError("Generation failed. Please try again.");
      setJobId(null);
    }
  });

  const handleGenerate = async (data: TTSRequest) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await generationApi.generateTTS(data);
      setJobId(response.job_id);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2 text-white">Text-to-Speech</h1>
      <p className="text-sm text-gray-400 mb-6">Generate speech using your cloned voice.</p>

      <TTSForm voices={trainedVoices} onSubmit={handleGenerate} isLoading={isLoading || !!jobId} />

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {jobId && (
        <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-400" />
            <p className="text-sm text-indigo-400">Generating audio... This may take a moment.</p>
          </div>
        </div>
      )}

      {result?.output_audio_url && (
        <div className="mt-6">
          <Player url={result.output_audio_url} title="Generated Audio" />
        </div>
      )}
    </div>
  );
}
