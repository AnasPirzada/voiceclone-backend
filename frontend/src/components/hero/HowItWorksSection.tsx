"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Upload, Cpu, Download, ArrowRight } from "lucide-react";
import { useRef, MouseEvent } from "react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Audio",
    description: "Upload a short voice sample or record directly in your browser. Just 10 seconds is enough.",
    color: "blue",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Processing",
    description: "Our neural network analyzes vocal patterns, tone, and characteristics to create a perfect clone.",
    color: "purple",
  },
  {
    icon: Download,
    step: "03",
    title: "Generate & Download",
    description: "Type any text and generate speech in the cloned voice. Download in multiple audio formats.",
    color: "cyan",
  },
];

const colorMap: Record<string, { gradient: string; glow: string; border: string; text: string }> = {
  blue: {
    gradient: "from-blue-500 to-blue-600",
    glow: "rgba(59, 130, 246, 0.2)",
    border: "rgba(59, 130, 246, 0.3)",
    text: "text-blue-400",
  },
  purple: {
    gradient: "from-purple-500 to-purple-600",
    glow: "rgba(168, 85, 247, 0.2)",
    border: "rgba(168, 85, 247, 0.3)",
    text: "text-purple-400",
  },
  cyan: {
    gradient: "from-cyan-500 to-cyan-600",
    glow: "rgba(6, 182, 212, 0.2)",
    border: "rgba(6, 182, 212, 0.3)",
    text: "text-cyan-400",
  },
};

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 150, damping: 20 });

  function handleMouse(e: MouseEvent) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const colors = colorMap[step.color];
  const Icon = step.icon;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group"
      initial={{ opacity: 0, y: 80, rotateX: 20 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.2, duration: 0.8, ease: "easeOut" }}
    >
      <div className="relative p-8 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-sm overflow-hidden transition-all duration-500 group-hover:border-white/[0.12]">
        {/* Glow on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${colors.glow}, transparent 70%)`,
          }}
        />

        {/* Step number - large background text */}
        <div
          className="absolute top-4 right-6 text-8xl font-black text-white/[0.03] select-none"
          style={{ transform: "translateZ(-10px)" }}
        >
          {step.step}
        </div>

        {/* Animated icon */}
        <motion.div
          className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.gradient} p-4 mb-6 shadow-lg`}
          style={{ transform: "translateZ(40px)" }}
          whileHover={{ scale: 1.1, rotateY: 20 }}
          animate={{
            boxShadow: [
              `0 10px 30px ${colors.glow}`,
              `0 15px 40px ${colors.glow}`,
              `0 10px 30px ${colors.glow}`,
            ],
          }}
          transition={{ boxShadow: { duration: 3, repeat: Infinity } }}
        >
          <Icon className="w-full h-full text-white" />
        </motion.div>

        {/* Step label */}
        <span className={`text-xs font-bold tracking-widest uppercase ${colors.text} mb-3 block`}>
          Step {step.step}
        </span>

        {/* Title */}
        <h3
          className="text-2xl font-bold text-white mb-3"
          style={{ transform: "translateZ(25px)" }}
        >
          {step.title}
        </h3>

        {/* Description */}
        <p
          className="text-gray-400 leading-relaxed"
          style={{ transform: "translateZ(15px)" }}
        >
          {step.description}
        </p>
      </div>
    </motion.div>
  );
}

export function HowItWorksSection() {
  return (
    <section className="relative py-32 overflow-hidden bg-[#030614]">
      {/* Connecting line background */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="absolute top-1/2 left-0 w-full h-1 hidden lg:block"
          style={{ transform: "translateY(-50%)" }}
        >
          <motion.line
            x1="20%"
            y1="0"
            x2="80%"
            y2="0"
            stroke="rgba(59, 130, 246, 0.1)"
            strokeWidth="2"
            strokeDasharray="8 8"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, delay: 0.5 }}
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20" style={{ perspective: "800px" }}>
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: 15 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-sm font-semibold text-purple-400 tracking-widest uppercase mb-4 block">
              How It Works
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Three Simple{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Steps
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              From voice sample to generated speech in minutes. Our streamlined process makes voice cloning effortless.
            </p>
          </motion.div>
        </div>

        {/* Steps Grid */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          style={{ perspective: "1200px" }}
        >
          {steps.map((step, i) => (
            <div key={step.step} className="relative">
              <StepCard step={step} index={i} />
              {/* Arrow between cards (desktop) */}
              {i < steps.length - 1 && (
                <motion.div
                  className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.2, duration: 0.5 }}
                >
                  <motion.div
                    animate={{ x: [0, 6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-6 h-6 text-white/20" />
                  </motion.div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
