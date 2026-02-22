"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { AIOrb, OrbState } from "./AIOrb";

interface PreviewPanelProps {
  orbState?: OrbState;
}

export function PreviewPanel({ orbState: externalOrbState }: PreviewPanelProps) {
  const [internalState, setInternalState] = useState<OrbState>("idle");
  const orbState = externalOrbState ?? internalState;

  const handleMicToggle = useCallback(() => {
    if (!externalOrbState) {
      setInternalState((prev) => (prev === "listening" ? "idle" : "listening"));
    }
  }, [externalOrbState]);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center h-full">
      {/* Orb container */}
      <div className="relative w-[460px] h-[460px] flex items-center justify-center">
        <AIOrb state={orbState} onMicToggle={handleMicToggle} />
      </div>

      {/* Status text */}
      <div className="mt-2 text-center">
        <motion.p
          className="text-base text-blue-300/70 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Clone your voice with AI...
        </motion.p>

        <motion.div
          className="flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {orbState === "listening" ? (
            <motion.span
              className="text-2xl font-semibold text-white"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              Listening...
            </motion.span>
          ) : orbState === "processing" ? (
            <motion.span
              className="text-lg text-purple-400"
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              Generating your voice...
            </motion.span>
          ) : orbState === "speaking" ? (
            <span className="text-lg text-emerald-400">Audio ready! ✓</span>
          ) : (
            <span className="text-lg text-gray-500">Select a voice & enter text to begin</span>
          )}
        </motion.div>
      </div>
    </div>
  );
}
