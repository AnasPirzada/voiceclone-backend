"use client";

import { useState, useRef, ChangeEvent, DragEvent, useCallback } from "react";
import {
  UploadCloud,
  FileAudio,
  X,
  Type,
  Mic,
  Languages,
  Sliders,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SUPPORTED_LANGUAGES, EMOTIONS } from "@/lib/utils/constants";

interface ControlPanelProps {
  onGenerate?: (data: {
    text: string;
    file: File | null;
    language: string;
    emotion: string | null;
    pitchShift: number;
    speed: number;
    voiceProfileId: string | null;
  }) => void;
  isGenerating?: boolean;
  voices?: Array<{ id: string; name: string; status: string }>;
}

export function ControlPanel({ onGenerate, isGenerating, voices = [] }: ControlPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("en");
  const [emotion, setEmotion] = useState<string | null>(null);
  const [pitchShift, setPitchShift] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const trainedVoices = voices.filter((v) => v.status === "trained");

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isAudioFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isAudioFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const isAudioFile = (f: File) => {
    return f.type.startsWith("audio/") || /\.(wav|mp3|ogg|flac|m4a|webm)$/i.test(f.name);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = useCallback(() => {
    if (!text.trim() || !selectedVoiceId) return;
    onGenerate?.({
      text: text.trim(),
      file,
      language,
      emotion,
      pitchShift,
      speed,
      voiceProfileId: selectedVoiceId,
    });
  }, [text, file, language, emotion, pitchShift, speed, selectedVoiceId, onGenerate]);

  const canGenerate = text.trim().length > 0 && selectedVoiceId && !isGenerating;

  return (
    <div className="p-4 space-y-3 h-full flex flex-col">
      {/* Section Title */}
      <div className="flex items-center gap-2.5 px-1 pb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Mic className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide">Voice Input</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Configure Source</p>
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />

      {/* Voice Selector */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="rounded-xl bg-gradient-to-b from-[#151B2E] to-[#111827] border border-gray-800/60 p-4 hover:border-gray-700/60 transition-colors duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center">
              <Mic className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Voice</h3>
          </div>

          <div className="relative">
            <select
              value={selectedVoiceId || ""}
              onChange={(e) => setSelectedVoiceId(e.target.value || null)}
              className="w-full bg-[#0B0F19]/60 border border-gray-800/60 rounded-lg px-3 py-2.5 text-xs text-gray-200 appearance-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500/30 outline-none transition-all duration-200"
            >
              <option value="">Select a trained voice...</option>
              {trainedVoices.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
          </div>

          {trainedVoices.length === 0 && (
            <p className="text-[10px] text-amber-400/70 mt-2">
              No trained voices yet. Create and train a voice in the Dashboard first.
            </p>
          )}
        </div>
      </motion.div>

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <div className="rounded-xl bg-gradient-to-b from-[#151B2E] to-[#111827] border border-gray-800/60 p-4 hover:border-gray-700/60 transition-colors duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center">
              <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Reference Audio <span className="text-gray-600 normal-case">(optional)</span></h3>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.wav,.mp3,.ogg,.flac,.m4a,.webm"
            onChange={handleFileChange}
            className="hidden"
          />

          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-300 group overflow-hidden ${
                  isDragging
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-700/60 hover:border-blue-500/40 bg-[#0B0F19]/40"
                }`}
              >
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
                  backgroundSize: "16px 16px"
                }} />
                <div className="relative">
                  <div className={`w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isDragging ? "bg-blue-500/20" : "bg-gray-800/50 group-hover:bg-blue-500/10"
                  }`}>
                    <UploadCloud className={`w-5 h-5 transition-all duration-300 ${
                      isDragging ? "text-blue-400 scale-110" : "text-gray-500 group-hover:text-blue-400"
                    }`} />
                  </div>
                  <p className="text-[10px] text-gray-400">Drop audio for voice conversion</p>
                  <p className="text-[9px] text-gray-600 mt-0.5">WAV, MP3, OGG, FLAC — Max 50MB</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="file-preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-500/20 rounded-lg"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center flex-shrink-0 ring-1 ring-blue-500/20">
                  <FileAudio className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{file.name}</p>
                  <p className="text-[10px] text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <button onClick={removeFile} className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="rounded-xl bg-gradient-to-b from-[#151B2E] to-[#111827] border border-gray-800/60 p-4 hover:border-gray-700/60 transition-colors duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Settings</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Language</label>
              <div className="relative">
                <select value={language} onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-[#0B0F19]/60 border border-gray-800/60 rounded-lg px-3 py-2 text-xs text-gray-200 appearance-none focus:ring-1 focus:ring-emerald-500/30 outline-none">
                  {Object.entries(SUPPORTED_LANGUAGES).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
                </select>
                <Languages className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Pitch: {pitchShift > 0 ? "+" : ""}{pitchShift}</label>
              <input type="range" min={-12} max={12} step={0.5} value={pitchShift} onChange={(e) => setPitchShift(Number(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:rounded-full" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Speed: {speed.toFixed(1)}x</label>
              <input type="range" min={0.5} max={2.0} step={0.1} value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:rounded-full" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Text Input */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="rounded-xl bg-gradient-to-b from-[#151B2E] to-[#111827] border border-gray-800/60 p-4 hover:border-gray-700/60 transition-colors duration-300 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-cyan-500/10 flex items-center justify-center">
                <Type className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Script</h3>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
              text.length > 4500
                ? "text-red-400 bg-red-500/10"
                : text.length > 0
                ? "text-cyan-400 bg-cyan-500/10"
                : "text-gray-600 bg-gray-800/50"
            }`}>
              {text.length}/5000
            </span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter the text you want to speak in your cloned voice..."
            maxLength={5000}
            className="w-full flex-1 min-h-[80px] bg-[#0B0F19]/40 border border-gray-800/60 rounded-lg p-3 text-xs text-gray-200 placeholder-gray-600 resize-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500/30 outline-none transition-all duration-200 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
          />
        </div>
      </motion.div>

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
            canGenerate
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
              : "bg-gray-800/50 text-gray-600 cursor-not-allowed"
          }`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
              Generating...
            </span>
          ) : (
            "Generate Voice"
          )}
        </button>
      </motion.div>
    </div>
  );
}
