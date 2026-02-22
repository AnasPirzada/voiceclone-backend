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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Target Voice</label>
        <select value={voiceId} onChange={(e) => setVoiceId(e.target.value)} className="w-full border rounded p-2" required>
          <option value="">Select voice</option>
          {voices.map((v) => (<option key={v.id} value={v.id}>{v.name}</option>))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Source Audio</label>
        <Upload onFileSelect={setFile} />
        {file && <p className="text-sm mt-1">{file.name}</p>}
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
      <div>
        <label className="block text-sm font-medium mb-1">Pitch: {pitchShift > 0 ? "+" : ""}{pitchShift}</label>
        <input type="range" min={-12} max={12} step={0.5} value={pitchShift} onChange={(e) => setPitchShift(Number(e.target.value))} className="w-full" />
      </div>
      <button type="submit" disabled={isLoading || !voiceId || !file} className="w-full py-2 px-4 bg-indigo-600 text-white rounded disabled:opacity-50">
        {isLoading ? "Converting..." : "Convert Voice"}
      </button>
    </form>
  );
}
