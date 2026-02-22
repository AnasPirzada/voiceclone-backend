"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { voicesApi } from "@/lib/api/voices";
import { VoiceProfile } from "@/types/voice";
import { useJobPolling } from "@/hooks/use-jobs";
import { getErrorMessage } from "@/lib/utils/error-handler";

export default function TrainVoicePage() {
  const params = useParams();
  const router = useRouter();
  const voiceId = params.id as string;

  const [voice, setVoice] = useState<VoiceProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTraining, setIsTraining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [trainingStatus, setTrainingStatus] = useState<string | null>(null);

  // Training parameters
  const [epochs, setEpochs] = useState(100);
  const [batchSize, setBatchSize] = useState(8);
  const [learningRate, setLearningRate] = useState(0.0001);

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

  // Poll for training progress
  useJobPolling(jobId, useCallback(async (status: string, prog: number) => {
    setTrainingStatus(status);
    setProgress(prog);

    if (status === "completed") {
      setJobId(null);
      setIsTraining(false);
      // Redirect to voice detail page after short delay
      setTimeout(() => {
        router.push(`/dashboard/voices/${voiceId}`);
      }, 2000);
    }

    if (status === "failed") {
      setJobId(null);
      setIsTraining(false);
      setError("Training failed. Please try again with different settings or more samples.");
    }
  }, [voiceId, router]));

  const handleStartTraining = async () => {
    setIsTraining(true);
    setError(null);
    setTrainingStatus("queued");
    setProgress(0);

    try {
      const response = await voicesApi.train({
        voice_profile_id: voiceId,
        epochs,
        batch_size: batchSize,
        learning_rate: learningRate,
      });
      setJobId(response.job_id);
    } catch (err) {
      setError(getErrorMessage(err));
      setIsTraining(false);
      setTrainingStatus(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!voice) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || "Voice not found"}</p>
        <Link href="/dashboard/voices" className="text-indigo-600 hover:underline">Back to Voices</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link href={`/dashboard/voices/${voiceId}`} className="text-sm text-gray-400 hover:text-white mb-4 block">
        ← Back to {voice.name}
      </Link>
      <h1 className="text-2xl font-bold mb-2">Train Voice Model</h1>
      <p className="text-sm text-gray-400 mb-8">
        Fine-tune the AI model on your {voice.sample_count} voice sample{voice.sample_count !== 1 ? "s" : ""} ({voice.total_duration_seconds.toFixed(1)}s total).
      </p>

      {/* Prerequisites Check */}
      <div className="border border-gray-700 rounded-xl p-6 mb-6 bg-gray-900/50">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Prerequisites</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
              voice.sample_count > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            }`}>
              {voice.sample_count > 0 ? "✓" : "✗"}
            </div>
            <span className="text-sm text-gray-300">
              Audio samples uploaded ({voice.sample_count} sample{voice.sample_count !== 1 ? "s" : ""})
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
              voice.total_duration_seconds >= 3 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            }`}>
              {voice.total_duration_seconds >= 3 ? "✓" : "✗"}
            </div>
            <span className="text-sm text-gray-300">
              Minimum 3 seconds of audio ({voice.total_duration_seconds.toFixed(1)}s available)
            </span>
          </div>
        </div>
      </div>

      {/* Training Parameters */}
      {!isTraining && !trainingStatus && (
        <div className="border border-gray-700 rounded-xl p-6 mb-6 bg-gray-900/50">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Training Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Epochs: {epochs}</label>
              <input type="range" min={10} max={500} step={10} value={epochs} onChange={(e) => setEpochs(Number(e.target.value))}
                className="w-full" />
              <p className="text-[10px] text-gray-600 mt-1">More epochs = better quality but slower training</p>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Batch Size: {batchSize}</label>
              <input type="range" min={1} max={32} step={1} value={batchSize} onChange={(e) => setBatchSize(Number(e.target.value))}
                className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Learning Rate: {learningRate}</label>
              <select value={learningRate} onChange={(e) => setLearningRate(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200">
                <option value={0.001}>0.001 (Fast)</option>
                <option value={0.0005}>0.0005</option>
                <option value={0.0001}>0.0001 (Recommended)</option>
                <option value={0.00005}>0.00005</option>
                <option value={0.00001}>0.00001 (Precise)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Training Progress */}
      {(isTraining || trainingStatus) && (
        <div className="border border-gray-700 rounded-xl p-6 mb-6 bg-gray-900/50">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Training Progress</h2>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                trainingStatus === "failed" ? "bg-red-500" : trainingStatus === "completed" ? "bg-green-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-400">
            <span className="capitalize">{trainingStatus || "Queued"}</span>
            <span>{progress}%</span>
          </div>

          {trainingStatus === "completed" && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-400">
                Training complete! Your voice model is ready. Redirecting...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        {!isTraining && !trainingStatus && (
          <button
            onClick={handleStartTraining}
            disabled={voice.sample_count === 0 || voice.total_duration_seconds < 3}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Training
          </button>
        )}
        {trainingStatus === "completed" && (
          <Link
            href={`/dashboard/voices/${voiceId}`}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all"
          >
            View Voice Profile
          </Link>
        )}
      </div>
    </div>
  );
}
