"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Menu, MoreHorizontal, RefreshCw, Share2, Sparkles } from "lucide-react";

interface TopbarProps {
  title: string;
  hasReport: boolean;
  onMenuClick: () => void;
  onShare: () => void;
  onExport: () => void;
  onRegenerate: () => void;
}

export default function Topbar({
  title,
  hasReport,
  onMenuClick,
  onShare,
  onExport,
  onRegenerate,
}: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-subtle px-4">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary lg:hidden"
        >
          <Menu size={18} />
        </button>

        <div className="flex min-w-0 items-center gap-2 lg:hidden">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Sparkles size={13} strokeWidth={2.25} />
          </span>
        </div>

        <h1 className="truncate text-sm font-medium text-text-secondary">{title}</h1>
      </div>

      {hasReport && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onShare}
            className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary sm:flex"
          >
            <Share2 size={14} />
            Share
          </button>
          <button
            type="button"
            onClick={onExport}
            className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary sm:flex"
          >
            <Download size={14} />
            Export Report
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="More actions"
              aria-expanded={menuOpen}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              <MoreHorizontal size={18} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    onRegenerate();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                  <RefreshCw size={14} />
                  Regenerate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onExport();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary sm:hidden"
                >
                  <Download size={14} />
                  Export Report
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onShare();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary sm:hidden"
                >
                  <Share2 size={14} />
                  Share
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
