"use client";

interface HistoryItemProps {
  title: string;
  selected: boolean;
  onClick: () => void;
}

export default function HistoryItem({ title, selected, onClick }: HistoryItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={selected ? "true" : undefined}
      className={`w-full truncate rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
        selected
          ? "bg-surface text-text-primary"
          : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
      }`}
    >
      {title}
    </button>
  );
}
