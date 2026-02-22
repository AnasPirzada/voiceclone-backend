"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function Particle({ delay, duration, x, y, size }: { delay: number; duration: number; x: number; y: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-blue-400/30"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        filter: `blur(${size > 3 ? 1 : 0}px)`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0.5, 0],
        scale: [0, 1, 1.5, 0],
        y: [0, -150, -300],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
}

function FloatingOrb({ color, size, x, y, delay }: { color: string; size: number; x: number; y: number; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        background: `radial-gradient(circle at 30% 30%, ${color}, transparent 70%)`,
        filter: "blur(40px)",
      }}
      animate={{
        x: [0, 80, -40, 0],
        y: [0, -60, 40, 0],
        scale: [1, 1.3, 0.9, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 15 + delay * 3,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export function GradientBackground() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; duration: number; size: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 60 + Math.random() * 40,
      delay: Math.random() * 8,
      duration: 4 + Math.random() * 6,
      size: 1 + Math.random() * 4,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Deep space gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030614] via-[#0B0F19] to-[#0d0a2e]" />

      {/* 3D Perspective Grid */}
      <div className="absolute inset-0" style={{ perspective: "600px" }}>
        <motion.div
          className="absolute w-full h-full origin-bottom"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(60deg)",
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            top: "40%",
          }}
          animate={{
            backgroundPosition: ["0px 0px", "0px 60px"],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Horizontal light beam */}
      <motion.div
        className="absolute top-1/2 left-0 right-0 h-[1px]"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3), transparent)",
        }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating orbs with 3D depth */}
      <FloatingOrb color="rgba(59, 130, 246, 0.4)" size={400} x={-5} y={-10} delay={0} />
      <FloatingOrb color="rgba(168, 85, 247, 0.35)" size={350} x={70} y={60} delay={2} />
      <FloatingOrb color="rgba(6, 182, 212, 0.25)" size={300} x={40} y={20} delay={4} />
      <FloatingOrb color="rgba(236, 72, 153, 0.2)" size={250} x={80} y={10} delay={6} />

      {/* Central glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(168, 85, 247, 0.06) 40%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <Particle key={p.id} {...p} />
      ))}

      {/* Subtle noise overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette effect for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(3, 6, 20, 0.8) 100%)",
        }}
      />
    </div>
  );
}
