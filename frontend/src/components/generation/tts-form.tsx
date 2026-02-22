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
      voice_profile_id: voiceId,
      text,
      language,
      emotion,
      pitch_shift: pitchShift,
      speed,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Voice</label>
        <select value={voiceId} onChange={(e) => setVoiceId(e.target.value)} className="w-full border rounded p-2" required>
          <option value="">Select voice</option>
          {voices.map((v) => (<option key={v.id} value={v.id}>{v.name}</option>))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Text</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full border rounded p-2 min-h-[120px]" maxLength={5000} required />
        <p className="text-xs text-muted-foreground">{text.length}/5000</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full border rounded p-2">
            {Object.entries(SUPPORTED_LANGUAGES).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Emotion</label>
          <select value={emotion || ""} onChange={(e) => setEmotion(e.target.value || null)} className="w-full border rounded p-2">
            <option value="">None</option>
            {EMOTIONS.map((e) => (<option key={e} value={e}>{e}</option>))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Pitch: {pitchShift > 0 ? "+" : ""}{pitchShift}</label>
          <input type="range" min={-12} max={12} step={0.5} value={pitchShift} onChange={(e) => setPitchShift(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Speed: {speed.toFixed(1)}x</label>
          <input type="range" min={0.5} max={2.0} step={0.1} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full" />
        </div>
      </div>
      <button type="submit" disabled={isLoading || !voiceId || !text} className="w-full py-2 px-4 bg-indigo-600 text-white rounded disabled:opacity-50">
        {isLoading ? "Generating..." : "Generate Speech"}
      </button>
    </form>
  );
}
