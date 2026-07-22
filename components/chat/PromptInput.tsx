"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Paperclip } from "lucide-react";

interface PromptInputProps {
  onSubmit: (idea: string) => void;
  isLoading: boolean;
}

const MAX_HEIGHT = 200;

export default function PromptInput({ onSubmit, isLoading }: PromptInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="w-full rounded-2xl border border-border bg-surface px-3.5 py-2.5 shadow-sm transition-colors focus-within:border-primary/60">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe your startup idea..."
        rows={1}
        disabled={isLoading}
        aria-label="Describe your startup idea"
        className="w-full resize-none bg-transparent text-sm leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-60"
      />

      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          disabled
          title="Attach file (coming soon)"
          aria-label="Attach file (coming soon)"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Paperclip size={16} />
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !value.trim()}
          aria-label="Evaluate idea"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          Evaluate Idea
          <ArrowUp size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
