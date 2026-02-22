"use client";

import { useRef, useEffect } from "react";
import { useAudioPlayer } from "@/hooks/use-audio";
import { formatDuration } from "@/lib/utils/format";

interface WaveformProps {
  audioUrl: string;
  className?: string;
}

export function Waveform({ audioUrl, className }: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isPlaying, duration, currentTime, loadAudio, togglePlay } = useAudioPlayer(containerRef);

  useEffect(() => {
    if (audioUrl) loadAudio(audioUrl);
  }, [audioUrl, loadAudio]);

  return (
    <div className={className}>
      <div ref={containerRef} />
      <div className="flex items-center justify-between mt-2">
        <button onClick={togglePlay} className="px-3 py-1 rounded bg-indigo-600 text-white text-sm">
          {isPlaying ? "Pause" : "Play"}
        </button>
        <span className="text-sm text-muted-foreground">
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </span>
      </div>
    </div>
  );
}
