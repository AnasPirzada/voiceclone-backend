"use client";

import { useCallback, useState } from "react";
import { validateAudioFile } from "@/lib/utils/validation";

interface UploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
}

export function Upload({ onFileSelect, accept = "audio/*" }: UploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateAudioFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
        dragOver
          ? "border-indigo-500 bg-indigo-500/10"
          : "border-gray-700 hover:border-gray-600 bg-gray-800/30"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
    >
      <input
        type="file"
        accept={accept}
        className="hidden"
        id="audio-upload"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      <label htmlFor="audio-upload" className="cursor-pointer">
        <div className="text-3xl mb-2">📂</div>
        <p className="text-sm text-gray-300">Drag & drop audio file or click to browse</p>
        <p className="text-xs text-gray-500 mt-1">WAV, MP3, FLAC, OGG, M4A — up to 50MB</p>
      </label>
      {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
    </div>
  );
}
