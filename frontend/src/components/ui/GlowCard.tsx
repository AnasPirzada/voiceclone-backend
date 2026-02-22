"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "blue" | "purple" | "gradient";
}

export function GlowCard({ children, className = "", glowColor = "gradient" }: GlowCardProps) {
  const glowClasses = {
    blue: "border-blue-500/20 shadow-blue-500/10",
    purple: "border-purple-500/20 shadow-purple-500/10",
    gradient: "border-blue-500/20 shadow-blue-500/10",
  };

  return (
    <motion.div
      className={`relative bg-[#111827] border ${glowClasses[glowColor]} rounded-xl p-6 backdrop-blur-sm ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
