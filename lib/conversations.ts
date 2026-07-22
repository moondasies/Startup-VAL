export type MessageRole = "user" | "assistant";
export type MessageStatus = "loading" | "done" | "error";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  createdAt: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "startup-evaluator-conversations";
const MAX_CONVERSATIONS = 30;

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function deriveTitle(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}...` : trimmed;
}

export function createMessage(
  role: MessageRole,
  content: string,
  status: MessageStatus = "done"
): ChatMessage {
  return { id: genId(), role, content, status, createdAt: Date.now() };
}

export function createConversation(idea: string): Conversation {
  const now = Date.now();
  return {
    id: genId(),
    title: deriveTitle(idea),
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function findPrecedingUserMessage(
  conversation: Conversation,
  assistantMessageId: string
): ChatMessage | null {
  const idx = conversation.messages.findIndex((m) => m.id === assistantMessageId);
  for (let i = idx - 1; i >= 0; i--) {
    if (conversation.messages[i].role === "user") return conversation.messages[i];
  }
  return null;
}

export function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistConversations(conversations: Conversation[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(conversations.slice(0, MAX_CONVERSATIONS))
    );
  } catch {
    // localStorage unavailable (e.g. private browsing quota) — history just won't persist.
  }
}
