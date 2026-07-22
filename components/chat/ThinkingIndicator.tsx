"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const MESSAGES = [
  "Analyzing startup...",
  "Researching market...",
  "Evaluating competition...",
  "Estimating risks...",
  "Preparing investor report...",
];

export default function ThinkingIndicator() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface px-4 py-3.5">
      <div className="flex items-center gap-2">
        <Loader2 size={15} className="animate-spin text-primary" />
        <AnimatePresence mode="wait">
          <motion.span
            key={MESSAGES[index]}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-medium text-text-secondary"
          >
            {MESSAGES[index]}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-2 opacity-60">
        <div className="h-2.5 w-2/3 animate-pulse rounded bg-surface-hover" />
        <div className="h-2.5 w-1/2 animate-pulse rounded bg-surface-hover" />
      </div>
    </div>
  );
}
