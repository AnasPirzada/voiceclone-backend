"use client";

import { useState } from "react";
import { SUPPORTED_LANGUAGES, EMOTIONS } from "@/lib/utils/constants";
import { TTSRequest } from "@/types/api";

interface TTSFormProps {
  voices: Array<{ id: string; name: string }>;
  onSubmit: (data: TTSRequest) => Promise<void>;
  isLoading?: boolean;
}

export function TTSForm({ voices, onSubmit, isLoading }: TTSFormProps) {
  const [text, setText] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [language, setLanguage] = useState("en");
  const [emotion, setEmotion] = useState<string | null>(null);
  const [pitchShift, setPitchShift] = useState(0);
  const [speed, setSpeed] = useState(1.0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      voice_profile_id: voiceId || null,
      text,
      language,
      emotion,
      pitch_shift: pitchShift,
      speed,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="border border-gray-700 rounded-xl p-6 bg-gray-900/50 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-400">Voice</label>
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
          <label className="block text-sm font-medium mb-1 text-gray-400">Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 focus:ring-1 focus:ring-indigo-500/50 outline-none min-h-[140px] resize-y"
            maxLength={5000}
            placeholder="Type the text you want to convert to speech..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">{text.length}/5000 characters</p>
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

        <div className="grid grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">
              Speed: <span className="text-indigo-400">{speed.toFixed(1)}x</span>
            </label>
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.1}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !voiceId || !text}
        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Generating..." : "Generate Speech"}
      </button>
    </form>
  );
}
