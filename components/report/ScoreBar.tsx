"use client";

import { motion } from "framer-motion";

interface ScoreBarProps {
  name: string;
  score: number;
  max: number;
}

function colorForRatio(ratio: number): string {
  if (ratio >= 0.7) return "var(--color-success)";
  if (ratio >= 0.4) return "var(--color-warning)";
  return "var(--color-danger)";
}

export default function ScoreBar({ name, score, max }: ScoreBarProps) {
  // Some model responses report the score as a 0-100 percentage rather than
  // points out of `max` (e.g. "70 / 15"), which is only detectable because
  // it produces an impossible score > max. Treat that case as a percentage.
  const ratio =
    score > max ? Math.min(1, Math.max(0, score / 100)) : max > 0 ? Math.min(1, Math.max(0, score / max)) : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-text-secondary">{name}</span>
        <span className="font-medium text-text-primary">{Math.round(ratio * 100)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: colorForRatio(ratio) }}
          initial={{ width: 0 }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
