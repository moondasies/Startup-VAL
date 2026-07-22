import type { LucideIcon } from "lucide-react";

interface InsightCardProps {
  icon: LucideIcon;
  text: string;
  tone?: "positive" | "negative" | "neutral";
}

const TONE_CLASSES: Record<NonNullable<InsightCardProps["tone"]>, string> = {
  positive: "text-success",
  negative: "text-danger",
  neutral: "text-secondary",
};

export default function InsightCard({ icon: Icon, text, tone = "neutral" }: InsightCardProps) {
  return (
    <li className="flex items-start gap-2.5">
      <Icon size={15} strokeWidth={2.25} className={`mt-0.5 shrink-0 ${TONE_CLASSES[tone]}`} />
      <span className="text-text-secondary">{text}</span>
    </li>
  );
}
