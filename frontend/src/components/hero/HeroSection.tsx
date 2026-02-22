"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Play, Sparkles, Mic, Volume2, Wand2, ArrowRight, Headphones, Radio } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, MouseEvent } from "react";
import { PrimaryButton } from "../ui/PrimaryButton";
import { GradientBackground } from "../ui/GradientBackground";

/* ─── 3D Tilt Card ──────────────────────────────────────────────────── */
function Tilt3DCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });

  function handleMouse(e: MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Floating 3D Element ────────────────────────────────────────────── */
function FloatingIcon({ icon: Icon, x, y, delay, size = 40, color = "blue" }: {
  icon: typeof Mic;
  x: number;
  y: number;
  delay: number;
  size?: number;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/20 text-purple-400",
    cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/20 text-cyan-400",
    pink: "from-pink-500/20 to-pink-600/10 border-pink-500/20 text-pink-400",
  };

  return (
    <motion.div
      className={`absolute bg-gradient-to-br ${colorMap[color]} border backdrop-blur-md rounded-xl p-3 shadow-2xl`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, scale: 0, rotateY: -90 }}
      animate={{
        opacity: [0.5, 0.9, 0.5],
        y: [0, -15, 0],
        rotateY: [0, 10, -10, 0],
        rotateX: [0, -5, 5, 0],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Icon size={size} />
    </motion.div>
  );
}

/* ─── 3D Audio Visualizer ──────────────────────────────────────────── */
function AudioVisualizer3D() {
  const bars = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div
      className="relative h-48 w-full max-w-4xl mx-auto"
      style={{ perspective: "800px" }}
    >
      <motion.div
        className="absolute inset-0 flex items-end justify-center gap-[3px]"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(25deg)",
        }}
        initial={{ opacity: 0, rotateX: 45 }}
        animate={{ opacity: 1, rotateX: 25 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        {bars.map((bar) => {
          const centerDistance = Math.abs(bar - 30) / 30;
          const maxHeight = 80 * (1 - centerDistance * 0.5);
          return (
            <motion.div
              key={bar}
              className="rounded-t-sm origin-bottom"
              style={{
                width: "6px",
                transformStyle: "preserve-3d",
                background: `linear-gradient(to top, rgba(59, 130, 246, 0.8), rgba(168, 85, 247, ${0.9 - centerDistance * 0.5}))`,
                boxShadow: "0 0 8px rgba(59, 130, 246, 0.3)",
              }}
              initial={{ height: 2 }}
              animate={{
                height: [2, maxHeight * (0.3 + Math.random() * 0.7), maxHeight * (0.5 + Math.random() * 0.5), 2],
                scaleZ: [1, 1.5, 1],
              }}
              transition={{
                duration: 1.5 + Math.random() * 1.5,
                repeat: Infinity,
                delay: bar * 0.03,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </motion.div>

      {/* Reflection */}
      <motion.div
        className="absolute inset-0 flex items-start justify-center gap-[3px] opacity-20"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(-25deg) scaleY(-1)",
          top: "55%",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        {bars.map((bar) => {
          const centerDistance = Math.abs(bar - 30) / 30;
          const maxHeight = 50 * (1 - centerDistance * 0.5);
          return (
            <motion.div
              key={bar}
              className="rounded-t-sm origin-bottom"
              style={{
                width: "6px",
                background: `linear-gradient(to top, rgba(59, 130, 246, 0.4), rgba(168, 85, 247, 0.2))`,
              }}
              initial={{ height: 2 }}
              animate={{
                height: [2, maxHeight * (0.3 + Math.random() * 0.7), 2],
              }}
              transition={{
                duration: 1.5 + Math.random() * 1.5,
                repeat: Infinity,
                delay: bar * 0.03,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </motion.div>

      {/* Glow beneath visualizer */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-20 rounded-full"
        style={{
          background: "radial-gradient(ellipse, rgba(59, 130, 246, 0.15), transparent 70%)",
          filter: "blur(20px)",
        }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ─── Animated Counter ───────────────────────────────────────────── */
function AnimatedNumber({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = value / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 25);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

/* ─── Rotating Ring ──────────────────────────────────────────────── */
function RotatingRing({ size, duration, color, delay = 0 }: { size: number; duration: number; color: string; delay?: number }) {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 rounded-full border"
      style={{
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderColor: color,
        transformStyle: "preserve-3d",
      }}
      animate={{
        rotateX: [60, 60],
        rotateZ: [0, 360],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

/* ─── HERO SECTION ───────────────────────────────────────────────── */
export function HeroSection() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: globalThis.MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030614]">
      <GradientBackground />

      {/* 3D Rotating rings in background */}
      <div className="absolute inset-0 pointer-events-none" style={{ perspective: "1200px" }}>
        <RotatingRing size={500} duration={20} color="rgba(59, 130, 246, 0.06)" />
        <RotatingRing size={650} duration={25} color="rgba(168, 85, 247, 0.05)" delay={2} />
        <RotatingRing size={800} duration={30} color="rgba(6, 182, 212, 0.04)" delay={4} />
      </div>

      {/* Floating 3D icons */}
      <div className="absolute inset-0 pointer-events-none hidden md:block" style={{ perspective: "1000px" }}>
        <motion.div
          style={{ x: mousePos.x * 0.5, y: mousePos.y * 0.5 }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        >
          <FloatingIcon icon={Mic} x={8} y={20} delay={0} color="blue" />
          <FloatingIcon icon={Volume2} x={85} y={25} delay={1} color="purple" />
          <FloatingIcon icon={Headphones} x={12} y={65} delay={2} color="cyan" />
          <FloatingIcon icon={Radio} x={82} y={70} delay={3} color="pink" />
          <FloatingIcon icon={Wand2} x={90} y={45} delay={1.5} color="cyan" />
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotateX: -30 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
          style={{ perspective: "600px" }}
        >
          <Tilt3DCard className="inline-block">
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm"
              animate={{
                borderColor: ["rgba(59,130,246,0.2)", "rgba(168,85,247,0.3)", "rgba(59,130,246,0.2)"],
                boxShadow: [
                  "0 0 20px rgba(59,130,246,0.1)",
                  "0 0 30px rgba(168,85,247,0.15)",
                  "0 0 20px rgba(59,130,246,0.1)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
              </motion.div>
              <span className="text-sm font-medium bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                AI-Powered Voice Cloning Technology
              </span>
            </motion.div>
          </Tilt3DCard>
        </motion.div>

        {/* Main Heading with 3D text effect */}
        <div style={{ perspective: "1000px" }}>
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-[0.95] tracking-tight"
            initial={{ opacity: 0, rotateX: 20, y: 60 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            transition={{ delay: 0.2, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.span
              className="block bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              style={{ backgroundSize: "200% auto" }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            >
              Clone Your Voice.
            </motion.span>
            <motion.span
              className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mt-2"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              style={{ backgroundSize: "200% auto" }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              Generate Anything.
            </motion.span>
          </motion.h1>
        </div>

        {/* Subtitle */}
        <motion.p
          className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Transform text into{" "}
          <span className="text-blue-400 font-medium">natural speech</span>{" "}
          with AI. No training required.
          <br className="hidden sm:block" />
          Generate professional voiceovers{" "}
          <span className="text-purple-400 font-medium">in seconds</span>.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-row gap-5 justify-center items-center mb-20 whitespace-nowrap"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          style={{ perspective: "600px" }}
        >
          <Link href="/studio">
            <Tilt3DCard>
              <PrimaryButton variant="primary" className="text-lg px-8 py-4 group">
                <span className="flex items-center gap-2">
                  Get Started Free
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </span>
              </PrimaryButton>
            </Tilt3DCard>
          </Link>
          <Tilt3DCard>
            <motion.button
              className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group px-6 py-4 rounded-xl border border-white/5 hover:border-white/10 backdrop-blur-sm bg-white/[0.02]"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.div
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors"
                animate={{ boxShadow: ["0 0 0 0 rgba(255,255,255,0.1)", "0 0 0 8px rgba(255,255,255,0)", "0 0 0 0 rgba(255,255,255,0.1)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Play className="w-4 h-4 ml-0.5" />
              </motion.div>
              <span className="font-medium">Watch Demo</span>
            </motion.button>
          </Tilt3DCard>
        </motion.div>

        {/* 3D Audio Visualizer */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1 }}
        >
          <AudioVisualizer3D />
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          {[
            { value: 50000, suffix: "+", label: "Voices Created" },
            { value: 99, suffix: "%", label: "Accuracy Rate" },
            { value: 150, suffix: "+", label: "Languages" },
          ].map((stat, i) => (
            <Tilt3DCard key={stat.label}>
              <motion.div
                className="text-center p-4 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm"
                whileHover={{
                  borderColor: "rgba(59, 130, 246, 0.3)",
                  boxShadow: "0 0 30px rgba(59, 130, 246, 0.1)",
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </motion.div>
            </Tilt3DCard>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2"
          animate={{ borderColor: ["rgba(255,255,255,0.2)", "rgba(59,130,246,0.4)", "rgba(255,255,255,0.2)"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1.5 h-1.5 bg-white/60 rounded-full"
            animate={{ y: [0, 16, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
