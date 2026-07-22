"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface SectionCardProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  delay?: number;
  iconClassName?: string;
}

export default function SectionCard({
  icon: Icon,
  title,
  children,
  delay = 0,
  iconClassName = "bg-primary/15 text-primary",
}: SectionCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay, ease: "easeOut" }}
      className="rounded-xl border border-border-subtle bg-surface p-5 shadow-sm"
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}>
          <Icon size={15} strokeWidth={2.25} />
        </span>
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      </div>
      <div className="text-sm leading-relaxed text-text-secondary">{children}</div>
    </motion.section>
  );
}
