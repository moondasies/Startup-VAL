"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import EmptyState from "@/components/chat/EmptyState";
import PromptInput from "@/components/chat/PromptInput";
import ProviderConfig from "@/components/chat/ProviderConfig";
import UserMessage from "@/components/chat/UserMessage";
import AssistantMessage from "@/components/chat/AssistantMessage";
import {
  createConversation,
  createMessage,
  deriveTitle,
  findPrecedingUserMessage,
  loadConversations,
  persistConversations,
  type ChatMessage,
  type Conversation,
} from "@/lib/conversations";
import {
  loadApiKey,
  loadProvider,
  saveApiKey,
  saveProvider,
  type Provider,
} from "@/lib/providerConfig";

async function fetchEvaluation(provider: Provider, apiKey: string, idea: string): Promise<string> {
  const res = await fetch("/api/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, apiKey, idea }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Something went wrong.");
  }

  return data.evaluation as string;
}

function lastMessage(
  conversation: Conversation | null,
  predicate: (m: ChatMessage) => boolean
): ChatMessage | null {
  if (!conversation) return null;
  for (let i = conversation.messages.length - 1; i >= 0; i--) {
    if (predicate(conversation.messages[i])) return conversation.messages[i];
  }
  return null;
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider | "">("");
  const [apiKey, setApiKey] = useState("");
  const [configError, setConfigError] = useState<string | null>(null);
  const hasLoaded = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  useEffect(() => {
    setConversations(loadConversations());
    setProvider(loadProvider());
    setApiKey(loadApiKey());
    hasLoaded.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) return;
    persistConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    if (!hasLoaded.current) return;
    saveProvider(provider);
  }, [provider]);

  useEffect(() => {
    if (!hasLoaded.current) return;
    saveApiKey(apiKey);
  }, [apiKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages, active?.id]);

  function updateMessage(conversationId: string, messageId: string, patch: Partial<ChatMessage>) {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: c.messages.map((m) => (m.id === messageId ? { ...m, ...patch } : m)),
              updatedAt: Date.now(),
            }
          : c
      )
    );
  }

  async function handleSubmit(idea: string): Promise<boolean> {
    if (!provider) {
      setConfigError("Select an AI provider.");
      return false;
    }

    if (!apiKey.trim()) {
      setConfigError("Please enter your API key.");
      return false;
    }

    setConfigError(null);

    const userMsg = createMessage("user", idea, "done");
    const assistantMsg = createMessage("assistant", "", "loading");

    let conversationId = activeId;

    if (!conversationId) {
      const conversation = createConversation(idea);
      conversationId = conversation.id;
      setConversations((prev) => [conversation, ...prev]);
      setActiveId(conversationId);
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, userMsg, assistantMsg], updatedAt: Date.now() }
          : c
      )
    );

    setIsSending(true);
    try {
      const evaluation = await fetchEvaluation(provider, apiKey, idea);
      updateMessage(conversationId, assistantMsg.id, { status: "done", content: evaluation });
    } catch (err) {
      updateMessage(conversationId, assistantMsg.id, {
        status: "error",
        content: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setIsSending(false);
    }

    return true;
  }

  async function regenerateMessage(conversationId: string, assistantMessageId: string) {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) return;

    const userMsg = findPrecedingUserMessage(conversation, assistantMessageId);
    if (!userMsg) return;

    if (!provider) {
      setConfigError("Select an AI provider.");
      return;
    }

    if (!apiKey.trim()) {
      setConfigError("Please enter your API key.");
      return;
    }

    setConfigError(null);
    setIsSending(true);
    updateMessage(conversationId, assistantMessageId, { status: "loading", content: "" });

    try {
      const evaluation = await fetchEvaluation(provider, apiKey, userMsg.content);
      updateMessage(conversationId, assistantMessageId, { status: "done", content: evaluation });
    } catch (err) {
      updateMessage(conversationId, assistantMessageId, {
        status: "error",
        content: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setIsSending(false);
    }
  }

  function handleTopbarRegenerate() {
    if (!active) return;
    const msg = lastMessage(active, (m) => m.role === "assistant" && m.status !== "loading");
    if (msg) regenerateMessage(active.id, msg.id);
  }

  async function copyMessage(content: string, messageId: string) {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId((id) => (id === messageId ? null : id)), 2000);
    } catch {
      // Clipboard API unavailable — silently ignore.
    }
  }

  function downloadMessage(content: string, title: string) {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "startup-evaluation"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function shareMessage(content: string, messageId: string) {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Startup Evaluation Report", text: content });
      } catch {
        // User cancelled or share failed — no action needed.
      }
    } else {
      copyMessage(content, messageId);
    }
  }

  function handleTopbarExport() {
    if (!active) return;
    const msg = lastMessage(active, (m) => m.role === "assistant" && m.status === "done");
    if (msg) downloadMessage(msg.content, active.title);
  }

  function handleTopbarShare() {
    if (!active) return;
    const msg = lastMessage(active, (m) => m.role === "assistant" && m.status === "done");
    if (msg) shareMessage(msg.content, msg.id);
  }

  const hasCompletedReport = Boolean(
    active && lastMessage(active, (m) => m.role === "assistant" && m.status === "done")
  );

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar
        conversations={conversations}
        selectedId={activeId}
        onSelect={(conversation) => setActiveId(conversation.id)}
        onLogoClick={() => setActiveId(null)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={active ? active.title : "New Evaluation"}
          hasReport={hasCompletedReport}
          onMenuClick={() => setSidebarOpen(true)}
          onShare={handleTopbarShare}
          onExport={handleTopbarExport}
          onRegenerate={handleTopbarRegenerate}
        />

        <div ref={scrollRef} className="flex flex-1 flex-col overflow-y-auto">
          {!active ? (
            <EmptyState onSubmit={handleSubmit} isLoading={isSending} />
          ) : (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
              {active.messages.map((message) => {
                if (message.role === "user") {
                  return <UserMessage key={message.id} content={message.content} />;
                }

                const precedingUser = findPrecedingUserMessage(active, message.id);
                const title = precedingUser ? deriveTitle(precedingUser.content) : active.title;

                return (
                  <AssistantMessage
                    key={message.id}
                    message={message}
                    title={title}
                    copied={copiedMessageId === message.id}
                    onCopy={() => copyMessage(message.content, message.id)}
                    onDownload={() => downloadMessage(message.content, title)}
                    onShare={() => shareMessage(message.content, message.id)}
                    onRegenerate={() => regenerateMessage(active.id, message.id)}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-border-subtle px-4 py-3">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
            <ProviderConfig
              provider={provider}
              apiKey={apiKey}
              onProviderChange={(p) => {
                setProvider(p);
                setConfigError(null);
              }}
              onApiKeyChange={(k) => {
                setApiKey(k);
                setConfigError(null);
              }}
              error={configError}
            />
            <PromptInput onSubmit={handleSubmit} isLoading={isSending} />
          </div>
        </div>
      </div>
    </div>
  );
}
