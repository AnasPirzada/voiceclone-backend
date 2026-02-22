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
    <div className="border border-gray-700 rounded-xl p-4 bg-gray-900/50">
      {title && <h4 className="text-sm font-medium mb-2 text-gray-300">{title}</h4>}
      <div ref={containerRef} className="mb-3" />
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center hover:from-indigo-700 hover:to-purple-700 transition-all"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        <span className="text-xs text-gray-500">
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </span>

        {/* Download link */}
        <a
          href={url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Download ↓
        </a>
      </div>
    </div>
  );
}
