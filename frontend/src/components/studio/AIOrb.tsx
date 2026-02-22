"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────
export type OrbState = "idle" | "listening" | "processing" | "speaking";

interface AIOrbProps {
  state?: OrbState;
  onMicToggle?: () => void;
}

// ─── Constants ───────────────────────────────────────────────────
const WAVE_LINES = 5;
const DOTS_PER_LINE = 50;
const ORB_SIZE = 240;

// ─── AIOrb Component ─────────────────────────────────────────────
export function AIOrb({ state = "idle", onMicToggle }: AIOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const amplitudeRef = useRef(0);
  const timeRef = useRef(0);
  const stateRef = useRef<OrbState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ── Web Audio API ──
  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;
    } catch {
      // mic not available
    }
  }, []);

  const stopMic = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (audioCtxRef.current?.state !== "closed") {
      audioCtxRef.current?.close();
    }
    audioCtxRef.current = null;
    analyserRef.current = null;
  }, []);

  useEffect(() => {
    if (state === "listening") {
      startMic();
    } else {
      stopMic();
    }
    return () => stopMic();
  }, [state, startMic, stopMic]);

  // ── Canvas animation loop ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = ORB_SIZE * 2; // extra space for glow
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    let running = true;
    const cx = size / 2;
    const cy = size / 2;
    const orbRadius = ORB_SIZE / 2;

    const tick = () => {
      if (!running) return;
      timeRef.current += 0.012;
      const t = timeRef.current;
      const currentState = stateRef.current;

      // Get mic amplitude
      if (analyserRef.current && (currentState === "listening" || currentState === "speaking")) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = sum / data.length / 255;
        amplitudeRef.current += (avg - amplitudeRef.current) * 0.15;
      } else {
        amplitudeRef.current += (0 - amplitudeRef.current) * 0.05;
      }

      const amp = amplitudeRef.current;

      ctx.clearRect(0, 0, size, size);

      // ─── Glow aura behind orb ───
      const glowAlpha = currentState === "listening" || currentState === "speaking"
        ? 0.12 + amp * 0.15
        : 0.06 + Math.sin(t * 0.5) * 0.02;
      const auraGrad = ctx.createRadialGradient(cx, cy, orbRadius * 0.5, cx, cy, orbRadius * 1.6);
      auraGrad.addColorStop(0, `rgba(59,130,246,${glowAlpha})`);
      auraGrad.addColorStop(0.5, `rgba(139,92,246,${glowAlpha * 0.6})`);
      auraGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = auraGrad;
      ctx.fillRect(0, 0, size, size);

      // ─── Simple clean orb ───
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius, 0, Math.PI * 2);

      // Fill with subtle gradient
      const orbGrad = ctx.createRadialGradient(
        cx - orbRadius * 0.2, cy - orbRadius * 0.2, 0,
        cx, cy, orbRadius
      );
      orbGrad.addColorStop(0, "rgba(30,40,80,0.6)");
      orbGrad.addColorStop(0.7, "rgba(15,20,45,0.5)");
      orbGrad.addColorStop(1, "rgba(10,15,35,0.4)");
      ctx.fillStyle = orbGrad;
      ctx.fill();

      // Thin border
      const borderAlpha = currentState === "listening" || currentState === "speaking"
        ? 0.3 + amp * 0.3
        : 0.15 + Math.sin(t * 0.8) * 0.05;
      ctx.strokeStyle = `rgba(100,140,255,${borderAlpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // ─── Clip to orb for waves ───
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius - 2, 0, Math.PI * 2);
      ctx.clip();

      // ─── Wavy particle lines flowing through the sphere ───
      for (let line = 0; line < WAVE_LINES; line++) {
        const lineOffset = (line - (WAVE_LINES - 1) / 2) * 28;
        const baseY = cy + lineOffset;

        // Each line has a different wave speed/phase
        const speed = currentState === "processing"
          ? 0.3
          : currentState === "listening" || currentState === "speaking"
          ? 1.5 + amp * 2
          : 0.6;
        const waveHeight = currentState === "processing"
          ? 8
          : currentState === "listening" || currentState === "speaking"
          ? 12 + amp * 40
          : 6 + Math.sin(t * 0.3 + line) * 3;
        const freq = 0.03 + line * 0.005;
        const phase = t * speed + line * 1.2;

        for (let d = 0; d < DOTS_PER_LINE; d++) {
          const progress = d / (DOTS_PER_LINE - 1);
          const x = cx - orbRadius + progress * orbRadius * 2;

          // Sine wave with layered frequencies
          const wave1 = Math.sin(progress * Math.PI * 2 * 1.5 + phase) * waveHeight;
          const wave2 = Math.sin(progress * Math.PI * 3 + phase * 0.7 + line) * waveHeight * 0.4;
          const y = baseY + wave1 + wave2;

          // Fade dots near edges of the orb
          const distFromCenter = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          const edgeFade = Math.max(0, 1 - distFromCenter / (orbRadius - 4));
          const horizFade = 1 - Math.pow(Math.abs(progress - 0.5) * 2, 3);

          const alpha = edgeFade * horizFade * (
            currentState === "listening" || currentState === "speaking"
              ? 0.5 + amp * 0.5
              : 0.25 + Math.sin(t + d * 0.1) * 0.1
          );

          if (alpha <= 0.01) continue;

          const dotSize = currentState === "listening" || currentState === "speaking"
            ? 1.5 + amp * 1.5
            : 1.2 + Math.sin(t * 0.5 + d * 0.2) * 0.3;

          // Color: blue → purple shift per line
          const hue = 220 + line * 15;
          const lightness = 60 + (currentState === "listening" ? amp * 20 : 0);

          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, 80%, ${lightness}%, ${alpha})`;
          ctx.fill();

          // Glow on active dots
          if (alpha > 0.3 && (currentState === "listening" || currentState === "speaking")) {
            ctx.beginPath();
            ctx.arc(x, y, dotSize * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${hue}, 80%, ${lightness}%, ${alpha * 0.15})`;
            ctx.fill();
          }
        }
      }

      ctx.restore();

      // ─── Outer glow ring (very subtle) ───
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius + 1, 0, Math.PI * 2);
      const ringAlpha = currentState === "listening" || currentState === "speaking"
        ? 0.08 + amp * 0.12
        : 0.03 + Math.sin(t * 0.6) * 0.02;
      ctx.shadowColor = `rgba(100,140,255,${ringAlpha * 3})`;
      ctx.shadowBlur = 20;
      ctx.strokeStyle = `rgba(100,140,255,${ringAlpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const isActive = state === "listening" || state === "speaking";

  return (
    <div className="relative flex items-center justify-center w-full h-full select-none">
      {/* Pulse rings */}
      <PulseRings state={state} />

      {/* Canvas orb + waves */}
      <motion.div
        className="absolute z-20"
        animate={{
          scale: isActive ? [1, 1.03, 1] : [1, 1.015, 1],
        }}
        transition={{
          duration: isActive ? 2 : 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <canvas
          ref={canvasRef}
          className="block"
          style={{ width: ORB_SIZE * 2, height: ORB_SIZE * 2 }}
        />
      </motion.div>

      {/* Mic Button */}
      {onMicToggle && (
        <MicButton state={state} onToggle={onMicToggle} />
      )}
    </div>
  );
}

// ─── Pulsing Outer Rings ─────────────────────────────────────────
function PulseRings({ state }: { state: OrbState }) {
  const isActive = state === "listening" || state === "speaking";

  const rings = [
    { size: ORB_SIZE + 40, delay: 0, duration: isActive ? 2.2 : 3.2 },
    { size: ORB_SIZE + 80, delay: 0.8, duration: isActive ? 2.5 : 3.5 },
  ];

  return (
    <>
      {rings.map((ring, i) => (
        <motion.div
          key={i}
          className="absolute z-10 rounded-full border border-blue-500/20"
          style={{
            width: ring.size,
            height: ring.size,
          }}
          animate={{
            scale: [1, 1.25, 1.4],
            opacity: [0.35, 0.12, 0],
          }}
          transition={{
            duration: ring.duration,
            repeat: Infinity,
            delay: ring.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </>
  );
}

// ─── Mic Button ──────────────────────────────────────────────────
function MicButton({
  state,
  onToggle,
}: {
  state: OrbState;
  onToggle: () => void;
}) {
  const isListening = state === "listening";

  return (
    <motion.button
      onClick={onToggle}
      className={`absolute z-30 bottom-0 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
        isListening
          ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_30px_rgba(59,130,246,0.5)]"
          : "bg-white/5 backdrop-blur-md border border-white/10 hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]"
      }`}
      style={{ transform: "translateY(50px)" }}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.08 }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke={isListening ? "white" : "#60a5fa"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
      </svg>
    </motion.button>
  );
}

export default AIOrb;
