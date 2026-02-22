"use client";

import { Star, Sparkles, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ControlPanel } from "./ControlPanel";
import { PreviewPanel } from "./PreviewPanel";
import { ResultsPanel } from "./ResultsPanel";
import { useVoices } from "@/hooks/use-voices";
import { generationApi } from "@/lib/api/generation";
import { useJobPolling } from "@/hooks/use-jobs";
import { GenerationStatusResponse } from "@/types/api";
import { OrbState } from "./AIOrb";

export function StudioLayout() {
  const { voices } = useVoices();
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState(0);
  const [result, setResult] = useState<GenerationStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orbState, setOrbState] = useState<OrbState>("idle");

  // Poll for job status updates
  useJobPolling(jobId, async (status, progress) => {
    setJobStatus(status);
    setJobProgress(progress);

    if (status === "processing") {
      setOrbState("processing");
    }

    if (status === "completed" && jobId) {
      const res = await generationApi.getTTSStatus(jobId);
      setResult(res);
      setJobId(null);
      setOrbState("speaking");
      // Reset orb after a moment
      setTimeout(() => setOrbState("idle"), 3000);
    }

    if (status === "failed") {
      setJobId(null);
      setOrbState("idle");
      setError("Generation failed. Please try again.");
    }
  });

  const handleGenerate = useCallback(async (data: {
    text: string;
    file: File | null;
    language: string;
    emotion: string | null;
    pitchShift: number;
    speed: number;
    voiceProfileId: string | null;
  }) => {
    if (!data.voiceProfileId) return;

    setError(null);
    setResult(null);
    setJobStatus("queued");
    setOrbState("processing");

    try {
      if (data.file) {
        // Voice conversion: upload file + convert using voice profile
        const response = await generationApi.convertVoice(
          {
            voice_profile_id: data.voiceProfileId,
            language: data.language,
            pitch_shift: data.pitchShift,
            emotion: data.emotion,
          },
          data.file
        );
        setJobId(response.job_id);
      } else {
        // Text-to-speech generation
        const response = await generationApi.generateTTS({
          voice_profile_id: data.voiceProfileId,
          text: data.text,
          language: data.language,
          emotion: data.emotion,
          pitch_shift: data.pitchShift,
          speed: data.speed,
        });
        setJobId(response.job_id);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to start generation");
      setOrbState("idle");
      setJobStatus(null);
    }
  }, []);

  return (
    <div className="h-screen bg-[#0B0F19] flex flex-col overflow-hidden">
      <StudioHeader />
      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="w-[320px] min-w-[320px] border-r border-gray-800/50 overflow-y-auto bg-gradient-to-b from-[#0E1425] to-[#0B0F19] scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          <ControlPanel
            onGenerate={handleGenerate}
            isGenerating={!!jobId}
            voices={voices}
          />
        </div>
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          <PreviewPanel orbState={orbState} />
        </div>
        <div className="w-[320px] min-w-[320px] border-l border-gray-800/50 overflow-y-auto bg-gradient-to-b from-[#0E1425] to-[#0B0F19] scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          <ResultsPanel
            jobStatus={jobStatus}
            jobProgress={jobProgress}
            outputUrl={result?.output_audio_url}
            duration={result?.duration_seconds}
            errorMessage={error || result?.error_message}
          />
        </div>
      </div>
    </div>
  );
}

function ComingSoonToast({ show, onClose }: { show: boolean; onClose: () => void }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999]"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#1a1a2e]/95 via-[#16213e]/95 to-[#1a1a2e]/95 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),0_0_40px_-10px_rgba(99,102,241,0.15)] px-6 py-4">
            <motion.div
              className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-sm tracking-wide">Coming Soon</span>
                <span className="text-gray-400 text-xs mt-0.5">Premium features are on the way. Stay tuned!</span>
              </div>
              <button onClick={onClose} className="flex-shrink-0 ml-3 p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 4, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StudioHeader() {
  const [showToast, setShowToast] = useState(false);
  const handleCloseToast = useCallback(() => setShowToast(false), []);

  return (
    <>
      <header className="border-b border-gray-800 bg-[#111827]/50 backdrop-blur-sm">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 font-bold text-lg">VoiceClone</span>
            <span className="text-white font-bold text-lg">Studio</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-xs text-gray-400 hover:text-white transition-colors">Dashboard</a>
            <a href="/dashboard/voices" className="text-xs text-gray-400 hover:text-white transition-colors">My Voices</a>
            <div
              onClick={() => setShowToast(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 cursor-pointer hover:border-yellow-500/50 transition-colors"
            >
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">PREMIUM</span>
            </div>
          </div>
        </div>
      </header>
      <ComingSoonToast show={showToast} onClose={handleCloseToast} />
    </>
  );
}
