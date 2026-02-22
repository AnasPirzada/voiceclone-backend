"use client";

import { useState } from "react";
import { Upload } from "@/components/audio/upload";
import { SUPPORTED_LANGUAGES, EMOTIONS } from "@/lib/utils/constants";

interface ConversionFormProps {
  voices: Array<{ id: string; name: string }>;
  onSubmit: (voiceId: string, file: File, options: { language: string; pitch_shift: number; emotion: string | null }) => Promise<void>;
  isLoading?: boolean;
}

export function ConversionForm({ voices, onSubmit, isLoading }: ConversionFormProps) {
  const [voiceId, setVoiceId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("en");
  const [pitchShift, setPitchShift] = useState(0);
  const [emotion, setEmotion] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !voiceId) return;
    await onSubmit(voiceId, file, { language, pitch_shift: pitchShift, emotion });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="border border-gray-700 rounded-xl p-6 bg-gray-900/50 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-400">Target Voice</label>
          <select
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 focus:ring-1 focus:ring-indigo-500/50 outline-none"
            required
          >
            <option value="">Select a trained voice</option>
            {voices.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
          {voices.length === 0 && (
            <p className="text-xs text-yellow-400/80 mt-1">No trained voices available. Train a voice first.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-400">Source Audio</label>
          <Upload onFileSelect={setFile} />
          {file && (
            <div className="flex items-center justify-between mt-2 py-2 px-3 bg-gray-800/50 rounded-lg">
              <span className="text-sm text-gray-300 truncate">{file.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-red-400/60 hover:text-red-400 text-sm transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 focus:ring-1 focus:ring-indigo-500/50 outline-none"
            >
              {Object.entries(SUPPORTED_LANGUAGES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Emotion</label>
            <select
              value={emotion || ""}
              onChange={(e) => setEmotion(e.target.value || null)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 focus:ring-1 focus:ring-indigo-500/50 outline-none"
            >
              <option value="">None</option>
              {EMOTIONS.map((e) => (
                <option key={e} value={e} className="capitalize">{e}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-400">
            Pitch: <span className="text-indigo-400">{pitchShift > 0 ? "+" : ""}{pitchShift}</span>
          </label>
          <input
            type="range"
            min={-12}
            max={12}
            step={0.5}
            value={pitchShift}
            onChange={(e) => setPitchShift(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !voiceId || !file}
        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Converting..." : "Convert Voice"}
      </button>
    </form>
  );
}
