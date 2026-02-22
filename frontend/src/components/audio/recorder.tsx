"use client";

import { useRecorder } from "@/hooks/use-recorder";
import { formatDuration } from "@/lib/utils/format";

interface RecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

export function Recorder({ onRecordingComplete }: RecorderProps) {
  const { isRecording, audioBlob, duration, startRecording, stopRecording, resetRecording } = useRecorder();

  const handleStop = async () => {
    const blob = await stopRecording();
    onRecordingComplete(blob);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 border border-gray-700 rounded-xl bg-gray-800/30">
      <div className={`text-2xl font-mono ${isRecording ? "text-red-400" : "text-gray-400"}`}>
        {formatDuration(duration)}
      </div>
      <div className="flex gap-2">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium"
          >
            🎙 Record
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors text-sm font-medium animate-pulse"
          >
            ⏹ Stop
          </button>
        )}
        {audioBlob && (
          <button
            onClick={resetRecording}
            className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 transition-all text-sm"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
