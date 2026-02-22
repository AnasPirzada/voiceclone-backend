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
    if (status === "failed") setJobId(null);
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
      <h1 className="text-2xl font-bold mb-6">Text-to-Speech</h1>
      <TTSForm voices={trainedVoices} onSubmit={handleGenerate} isLoading={isLoading || !!jobId} />
      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
      {jobId && <p className="text-sm text-muted-foreground mt-4">Generating audio...</p>}
      {result?.output_audio_url && (
        <div className="mt-6">
          <Player url={result.output_audio_url} title="Generated Audio" />
        </div>
      )}
    </div>
  );
}
