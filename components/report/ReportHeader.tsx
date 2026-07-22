"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  Copy,
  Download,
  RefreshCw,
  Search,
  Share2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Recommendation } from "@/lib/parseReport";

interface ReportHeaderProps {
  title: string;
  eyebrow: string;
  overallScore: number | null;
  recommendation: Recommendation | null;
  confidence: "High" | "Medium" | "Low";
  summary: string;
  onCopy: () => void;
  onDownload: () => void;
  onShare: () => void;
  onRegenerate: () => void;
  copied: boolean;
}

const RECOMMENDATION_STYLES: Record<
  Recommendation["level"],
  { icon: LucideIcon; className: string }
> = {
  strong: { icon: ShieldCheck, className: "bg-success/15 text-success" },
  improve: { icon: TrendingUp, className: "bg-primary/15 text-primary" },
  validate: { icon: Search, className: "bg-warning/15 text-warning" },
  "not-recommended": { icon: AlertCircle, className: "bg-danger/15 text-danger" },
};

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
    >
      <Icon size={15} />
    </button>
  );
}

export default function ReportHeader({
  title,
  eyebrow,
  overallScore,
  recommendation,
  confidence,
  summary,
  onCopy,
  onDownload,
  onShare,
  onRegenerate,
  copied,
}: ReportHeaderProps) {
  const rec = recommendation ? RECOMMENDATION_STYLES[recommendation.level] : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="rounded-xl border border-border bg-surface p-6 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-1.5 truncate text-xs font-medium uppercase tracking-wider text-text-muted">
              {eyebrow}
            </p>
          )}
          <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <ActionButton icon={Copy} label={copied ? "Copied!" : "Copy"} onClick={onCopy} />
          <ActionButton icon={Download} label="Download Markdown" onClick={onDownload} />
          <ActionButton icon={Share2} label="Share" onClick={onShare} />
          <ActionButton icon={RefreshCw} label="Regenerate" onClick={onRegenerate} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {overallScore !== null && (
          <span className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-bg px-3 py-1 text-sm">
            <span className="font-semibold text-text-primary">{overallScore}</span>
            <span className="text-text-muted">/ 100</span>
          </span>
        )}

        {rec && (
          <span
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${rec.className}`}
          >
            <rec.icon size={13} />
            {recommendation!.label}
          </span>
        )}

        <span className="flex items-center gap-1.5 rounded-full bg-secondary/15 px-3 py-1 text-sm font-medium text-secondary">
          Confidence: {confidence}
        </span>
      </div>

      {summary && (
        <p className="mt-4 text-sm leading-relaxed text-text-secondary">{summary}</p>
      )}
    </motion.section>
  );
}
