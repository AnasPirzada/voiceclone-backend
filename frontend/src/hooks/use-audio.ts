import { useState, useRef, useCallback, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";

export function useAudioPlayer(containerRef: React.RefObject<HTMLDivElement | null>) {
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#94a3b8",
      progressColor: "#6366f1",
      cursorColor: "#6366f1",
      height: 80,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
    });

    ws.on("ready", () => setDuration(ws.getDuration()));
    ws.on("audioprocess", () => setCurrentTime(ws.getCurrentTime()));
    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => setIsPlaying(false));

    wavesurferRef.current = ws;
    return () => ws.destroy();
  }, [containerRef]);

  const loadAudio = useCallback((url: string) => {
    wavesurferRef.current?.load(url);
  }, []);

  const togglePlay = useCallback(() => {
    wavesurferRef.current?.playPause();
  }, []);

  const seek = useCallback((progress: number) => {
    wavesurferRef.current?.seekTo(progress);
  }, []);

  return { isPlaying, duration, currentTime, loadAudio, togglePlay, seek };
}
