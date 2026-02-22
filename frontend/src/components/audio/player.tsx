"use client";

import { useRef, useEffect } from "react";
import { useAudioPlayer } from "@/hooks/use-audio";
import { formatDuration } from "@/lib/utils/format";

interface PlayerProps {
  url: string;
  title?: string;
}

export function Player({ url, title }: PlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isPlaying, duration, currentTime, loadAudio, togglePlay } = useAudioPlayer(containerRef);

  useEffect(() => {
    if (url) loadAudio(url);
  }, [url, loadAudio]);

  return (
    <div className="border rounded-lg p-4">
      {title && <h4 className="text-sm font-medium mb-2">{title}</h4>}
      <div ref={containerRef} className="mb-2" />
      <div className="flex items-center gap-4">
        <button onClick={togglePlay} className="p-2 rounded-full bg-indigo-600 text-white">
          {isPlaying ? "⏸" : "▶"}
        </button>
        <span className="text-xs text-muted-foreground">
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </span>
      </div>
    </div>
  );
}
