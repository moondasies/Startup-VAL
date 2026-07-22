"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Settings, Sparkles } from "lucide-react";
import HistoryItem from "@/components/history/HistoryItem";
import type { Conversation } from "@/lib/conversations";

interface SidebarContentProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
  onLogoClick: () => void;
}

function Brand({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-1 py-1 text-left rounded-lg transition-colors hover:bg-surface-hover"
      aria-label="Startup Evaluator AI — start a new evaluation"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Sparkles size={16} strokeWidth={2.25} />
      </span>
      <span className="text-sm font-semibold text-text-primary tracking-tight">
        Startup Evaluator AI
      </span>
    </button>
  );
}

function SidebarBody({ conversations, selectedId, onSelect, onLogoClick }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-3 pt-4 pb-3">
        <Brand onClick={onLogoClick} />
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <p className="px-1 pb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
          History
        </p>

        {conversations.length === 0 ? (
          <p className="px-1 py-2 text-sm text-text-muted">
            Your evaluations will appear here.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5" role="list">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <HistoryItem
                  title={conversation.title}
                  selected={conversation.id === selectedId}
                  onClick={() => onSelect(conversation)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-border-subtle px-3 py-3">
        <button
          type="button"
          aria-label="Settings"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          <Settings size={16} />
          Settings
        </button>
      </div>
    </div>
  );
}

interface SidebarProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
  onLogoClick: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  conversations,
  selectedId,
  onSelect,
  onLogoClick,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      <aside className="hidden lg:flex lg:w-[260px] lg:shrink-0 lg:flex-col lg:border-r lg:border-border-subtle lg:bg-bg">
        <SidebarBody
          conversations={conversations}
          selectedId={selectedId}
          onSelect={onSelect}
          onLogoClick={onLogoClick}
        />
      </aside>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/60"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative z-10 h-full w-[260px] border-r border-border-subtle bg-bg"
              role="dialog"
              aria-modal="true"
              aria-label="Sidebar"
            >
              <SidebarBody
                conversations={conversations}
                selectedId={selectedId}
                onSelect={(conversation) => {
                  onSelect(conversation);
                  onClose();
                }}
                onLogoClick={() => {
                  onLogoClick();
                  onClose();
                }}
              />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
