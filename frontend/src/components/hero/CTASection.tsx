"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRef, MouseEvent } from "react";

export function CTASection() {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 100, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 100, damping: 20 });

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

  return (
    <section className="relative py-32 overflow-hidden bg-[#030614]">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(59, 130, 246, 0.08), transparent 60%)",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouse}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: "1000px" }}
          initial={{ opacity: 0, y: 60, rotateX: 15 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative p-12 sm:p-16 rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-xl overflow-hidden text-center">
            {/* Inner glow */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: "radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.1), transparent 60%)",
              }}
              animate={{
                background: [
                  "radial-gradient(circle at 30% 0%, rgba(59, 130, 246, 0.1), transparent 60%)",
                  "radial-gradient(circle at 70% 0%, rgba(168, 85, 247, 0.1), transparent 60%)",
                  "radial-gradient(circle at 30% 0%, rgba(59, 130, 246, 0.1), transparent 60%)",
                ],
              }}
              transition={{ duration: 5, repeat: Infinity }}
            />

            {/* Animated sparkle particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-blue-400/50 rounded-full"
                style={{
                  left: `${15 + i * 15}%`,
                  top: `${20 + (i % 3) * 25}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  y: [0, -30, -60],
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.5,
                  repeat: Infinity,
                }}
              />
            ))}

            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-6"
            >
              <Sparkles className="w-8 h-8 text-blue-400" />
            </motion.div>

            <h2
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6"
              style={{ transform: "translateZ(30px)" }}
            >
              Ready to{" "}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Clone
              </span>
              ?
            </h2>

            <p
              className="text-lg text-gray-400 mb-10 max-w-xl mx-auto"
              style={{ transform: "translateZ(20px)" }}
            >
              Start creating amazing voiceovers today. No credit card required.
              Get 1000 free characters every month.
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              style={{ transform: "translateZ(40px)" }}
            >
              <Link href="/auth/register">
                <motion.button
                  className="relative px-8 py-4 rounded-xl font-semibold text-white text-lg overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Animated gradient background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
                    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                    style={{ backgroundSize: "200% 100%" }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.1) 50%, transparent 55%)",
                    }}
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    Start Free Trial
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.span>
                  </span>
                </motion.button>
              </Link>

              <Link href="/auth/login">
                <motion.button
                  className="px-8 py-4 rounded-xl font-medium text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-all backdrop-blur-sm bg-white/[0.02]"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Sign In
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Footer bar */}
      <motion.div
        className="relative z-10 mt-20 border-t border-white/[0.05] pt-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © 2026 VoiceClone AI. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
