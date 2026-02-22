"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Mic, Wand2, Globe, Zap, Shield, Layers } from "lucide-react";
import { useRef, MouseEvent } from "react";

const features = [
  {
    icon: Mic,
    title: "Voice Cloning",
    description: "Clone any voice with just a few seconds of audio. Our AI captures every nuance and inflection.",
    gradient: "from-blue-500 to-cyan-500",
    glow: "rgba(59, 130, 246, 0.15)",
  },
  {
    icon: Wand2,
    title: "Text to Speech",
    description: "Convert text into natural-sounding speech with emotion, pacing, and tone control.",
    gradient: "from-purple-500 to-pink-500",
    glow: "rgba(168, 85, 247, 0.15)",
  },
  {
    icon: Globe,
    title: "150+ Languages",
    description: "Generate speech in over 150 languages and dialects with native-quality pronunciation.",
    gradient: "from-cyan-500 to-emerald-500",
    glow: "rgba(6, 182, 212, 0.15)",
  },
  {
    icon: Zap,
    title: "Real-Time Processing",
    description: "Generate voiceovers instantly with our optimized AI pipeline. No waiting, no delays.",
    gradient: "from-amber-500 to-orange-500",
    glow: "rgba(245, 158, 11, 0.15)",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption and privacy controls. Your voice data stays yours, always.",
    gradient: "from-emerald-500 to-teal-500",
    glow: "rgba(16, 185, 129, 0.15)",
  },
  {
    icon: Layers,
    title: "Studio Editor",
    description: "Professional audio editor with waveform visualization, effects, and multi-track mixing.",
    gradient: "from-rose-500 to-violet-500",
    glow: "rgba(244, 63, 94, 0.15)",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: typeof features[0];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 20 });

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

  const Icon = feature.icon;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 60, rotateX: 15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.7, ease: "easeOut" }}
      whileHover={{ z: 30 }}
      className="group cursor-pointer"
    >
      <div
        className="relative h-full p-6 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-transparent backdrop-blur-sm overflow-hidden transition-all duration-500 group-hover:border-white/[0.12]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Glow effect on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${feature.glow}, transparent 60%)`,
          }}
        />

        {/* Animated border gradient */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${feature.glow}, transparent 40%, transparent 60%, ${feature.glow})`,
            padding: "1px",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
          }}
        />

        {/* Icon with 3D pop effect */}
        <motion.div
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-3 mb-5 shadow-lg`}
          style={{ transform: "translateZ(30px)" }}
          whileHover={{ scale: 1.1, rotateY: 15 }}
          transition={{ duration: 0.3 }}
        >
          <Icon className="w-full h-full text-white" />
        </motion.div>

        {/* Content */}
        <h3
          className="text-xl font-semibold text-white mb-3"
          style={{ transform: "translateZ(20px)" }}
        >
          {feature.title}
        </h3>
        <p
          className="text-gray-400 leading-relaxed text-sm"
          style={{ transform: "translateZ(10px)" }}
        >
          {feature.description}
        </p>

        {/* Floating dots decoration */}
        <motion.div
          className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white/10"
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
        />
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  return (
    <section className="relative py-32 overflow-hidden bg-[#030614]">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.06), transparent 60%)",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
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
            <span className="text-sm font-semibold text-blue-400 tracking-widest uppercase mb-4 block">
              Features
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Create
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Powerful AI tools designed for creators, developers, and businesses
              who demand the best in voice technology.
            </p>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          style={{ perspective: "1200px" }}
        >
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
