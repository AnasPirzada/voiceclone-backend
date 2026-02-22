"use client";

import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Download,
  Check,
  Loader2,
  Circle,
  Volume2,
  Zap,
  FileDown,
  Clock,
  HardDrive,
  Music,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type StepStatus = "pending" | "active" | "completed" | "failed";

interface PipelineStep {
  label: string;
  status: StepStatus;
  icon: React.ElementType;
}

interface ResultsPanelProps {
  jobStatus?: string | null;
  jobProgress?: number;
  outputUrl?: string | null;
  duration?: number | null;
  errorMessage?: string | null;
}

export function ResultsPanel({
  jobStatus,
  jobProgress = 0,
  outputUrl,
  duration,
  errorMessage,
}: ResultsPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Dynamic pipeline steps based on actual job status
  const steps: PipelineStep[] = (() => {
    if (!jobStatus) {
      return [
        { label: "Select Voice", status: "pending", icon: Volume2 },
        { label: "Enter Script", status: "pending", icon: Zap },
        { label: "AI Processing", status: "pending", icon: Music },
        { label: "Audio Ready", status: "pending", icon: FileDown },
      ];
    }

    if (jobStatus === "completed") {
      return [
        { label: "Voice Selected", status: "completed", icon: Volume2 },
        { label: "Script Received", status: "completed", icon: Zap },
        { label: "AI Processing", status: "completed", icon: Music },
        { label: "Audio Ready", status: "completed", icon: FileDown },
      ];
    }

    if (jobStatus === "failed") {
      return [
        { label: "Voice Selected", status: "completed", icon: Volume2 },
        { label: "Script Received", status: "completed", icon: Zap },
        { label: "AI Processing", status: "failed", icon: Music },
        { label: "Audio Ready", status: "pending", icon: FileDown },
      ];
    }

    if (jobStatus === "processing") {
      return [
        { label: "Voice Selected", status: "completed", icon: Volume2 },
        { label: "Script Received", status: "completed", icon: Zap },
        { label: "Cloning Voice", status: "active", icon: Music },
        { label: "Audio Ready", status: "pending", icon: FileDown },
      ];
    }

    // queued
    return [
      { label: "Voice Selected", status: "completed", icon: Volume2 },
      { label: "Script Received", status: "completed", icon: Zap },
      { label: "In Queue", status: "active", icon: Music },
      { label: "Audio Ready", status: "pending", icon: FileDown },
    ];
  })();

  const completedCount = steps.filter((s) => s.status === "completed").length;
  const progress = jobStatus === "completed"
    ? 100
    : jobStatus === "failed"
    ? 0
    : Math.round(
        ((completedCount + (steps.some((s) => s.status === "active") ? 0.5 : 0)) / steps.length) * 100
      );

  // Audio playback
  const togglePlay = () => {
    if (!audioRef.current || !outputUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (outputUrl) {
      audioRef.current = new Audio(outputUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [outputUrl]);

  const handleDownload = () => {
    if (!outputUrl) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = `voiceclone_${Date.now()}.wav`;
    a.click();
  };

  return (
    <div className="p-4 space-y-3 h-full flex flex-col">
      {/* Section Title */}
      <div className="flex items-center gap-2.5 px-1 pb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide">Output</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
            Results & Preview
          </p>
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />

      {/* AI Processing Pipeline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="rounded-xl bg-gradient-to-b from-[#151B2E] to-[#111827] border border-gray-800/60 p-4 hover:border-gray-700/60 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-cyan-500/10 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Pipeline
              </h3>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                jobStatus === "failed"
                  ? "text-red-400 bg-red-500/10"
                  : progress === 100
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-cyan-400 bg-cyan-500/10"
              }`}
            >
              {jobStatus === "failed" ? "Failed" : `${progress}%`}
            </span>
          </div>

          <div className="space-y-1">
            {steps.map((step, index) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex items-center gap-3 relative"
              >
                {index < steps.length - 1 && (
                  <div
                    className={`absolute left-[11px] top-[28px] w-[1px] h-[14px] ${
                      step.status === "completed"
                        ? "bg-cyan-500/30"
                        : step.status === "failed"
                        ? "bg-red-500/30"
                        : "bg-gray-800"
                    }`}
                  />
                )}
                <div className="flex items-center gap-3 py-1.5 px-2 rounded-lg w-full transition-colors duration-200 hover:bg-white/[0.02]">
                  <StepIndicator status={step.status} />
                  <span
                    className={`text-xs font-medium ${
                      step.status === "completed"
                        ? "text-gray-500"
                        : step.status === "active"
                        ? "text-cyan-300"
                        : step.status === "failed"
                        ? "text-red-400"
                        : "text-gray-600"
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.status === "active" && (
                    <motion.div className="ml-auto flex gap-0.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1 h-1 rounded-full bg-cyan-400"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-[10px] text-red-400">{errorMessage}</p>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-4 pt-3 border-t border-gray-800/50">
            <div className="w-full h-1.5 bg-gray-800/60 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full relative overflow-hidden"
                style={{
                  background: jobStatus === "failed"
                    ? "linear-gradient(90deg, #ef4444, #dc2626)"
                    : "linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              >
                {jobStatus !== "failed" && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Output / Player */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="rounded-xl bg-gradient-to-b from-[#151B2E] to-[#111827] border border-gray-800/60 p-4 hover:border-gray-700/60 transition-colors duration-300 flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md bg-purple-500/10 flex items-center justify-center">
              <Volume2 className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Preview
            </h3>
          </div>

          {/* Waveform */}
          <div className="relative bg-[#0B0F19]/50 border border-gray-800/40 rounded-lg p-4 mb-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.02] to-purple-500/[0.02]" />
            <div className="relative">
              <OutputWaveform isPlaying={isPlaying} hasOutput={!!outputUrl} />
            </div>
            <div className="relative flex items-center justify-between mt-3">
              <span className="text-[10px] text-gray-600 font-mono">0:00</span>
              <div className="flex-1 mx-3 h-px bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800" />
              <span className="text-[10px] text-gray-600 font-mono">
                {duration ? `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, "0")}` : "0:00"}
              </span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={togglePlay}
              disabled={!outputUrl}
              className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                !outputUrl
                  ? "bg-gray-800/30 text-gray-700 cursor-not-allowed"
                  : isPlaying
                  ? "text-white shadow-xl"
                  : "bg-[#0B0F19] border border-gray-700/60 text-gray-400 hover:border-cyan-500/40 hover:text-cyan-400"
              }`}
            >
              {isPlaying && outputUrl && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                    animate={{ scale: [1, 1.3], opacity: [0.3, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                </>
              )}
              <span className="relative">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleDownload}
              disabled={!outputUrl}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group ${
                !outputUrl
                  ? "bg-gray-800/30 text-gray-700 cursor-not-allowed"
                  : "bg-[#0B0F19] border border-gray-700/60 text-gray-400 hover:border-purple-500/40 hover:text-purple-400"
              }`}
            >
              <Download className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            </motion.button>
          </div>

          {/* Metadata */}
          <div className="space-y-2 pt-3 border-t border-gray-800/40">
            <MetadataRow icon={Music} label="Format" value="WAV 24kHz" color="text-cyan-400" />
            <MetadataRow
              icon={Clock}
              label="Duration"
              value={duration ? `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, "0")}` : "--:--"}
              color="text-blue-400"
            />
            <MetadataRow icon={HardDrive} label="Status" value={jobStatus || "Waiting"} color="text-purple-400" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MetadataRow({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between py-1 px-1 rounded-md hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-2">
        <Icon className={`w-3 h-3 ${color} opacity-60`} />
        <span className="text-[10px] text-gray-600 uppercase tracking-wider font-medium">{label}</span>
      </div>
      <span className="text-[10px] text-gray-400 font-mono capitalize">{value}</span>
    </div>
  );
}

function StepIndicator({ status }: { status: StepStatus }) {
  if (status === "completed") {
    return (
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
        className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 ring-1 ring-cyan-500/20">
        <Check className="w-3 h-3 text-cyan-400" />
      </motion.div>
    );
  }

  if (status === "active") {
    return (
      <div className="w-[22px] h-[22px] flex items-center justify-center flex-shrink-0 relative">
        <motion.div className="absolute inset-0 rounded-full bg-cyan-500/10" animate={{ scale: [1, 1.4], opacity: [0.5, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
        <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="w-[22px] h-[22px] rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 ring-1 ring-red-500/20">
        <X className="w-3 h-3 text-red-400" />
      </div>
    );
  }

  return (
    <div className="w-[22px] h-[22px] flex items-center justify-center flex-shrink-0">
      <Circle className="w-2.5 h-2.5 text-gray-700" />
    </div>
  );
}

function X_Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function OutputWaveform({ isPlaying, hasOutput }: { isPlaying: boolean; hasOutput: boolean }) {
  const bars = Array.from({ length: 45 }, (_, i) => i);

  return (
    <div className="flex items-center justify-center gap-[2px] h-16">
      {bars.map((bar, index) => {
        const baseHeight = Math.sin((index / bars.length) * Math.PI) * 100;
        const randomFactor = Math.random() * 30 + 20;
        const height = Math.max(8, baseHeight * 0.6 + randomFactor * 0.4);

        return (
          <motion.div
            key={bar}
            className="rounded-full"
            style={{
              width: 2,
              background: hasOutput
                ? isPlaying
                  ? `linear-gradient(to top, rgba(6,182,212,0.7), rgba(139,92,246,0.7))`
                  : `linear-gradient(to top, rgba(6,182,212,0.4), rgba(139,92,246,0.4))`
                : `linear-gradient(to top, rgba(6,182,212,0.15), rgba(139,92,246,0.15))`,
            }}
            animate={{
              height: isPlaying ? [height * 0.3, height, height * 0.3] : hasOutput ? height * 0.4 : height * 0.2,
              opacity: isPlaying ? [0.5, 1, 0.5] : hasOutput ? 0.5 : 0.2,
            }}
            transition={{
              duration: isPlaying ? Math.random() * 0.5 + 0.3 : 0.3,
              repeat: isPlaying ? Infinity : 0,
              delay: isPlaying ? index * 0.02 : 0,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}
