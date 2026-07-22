import ThinkingIndicator from "@/components/chat/ThinkingIndicator";
import Report from "@/components/report/Report";
import type { ChatMessage } from "@/lib/conversations";

interface AssistantMessageProps {
  message: ChatMessage;
  title: string;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onShare: () => void;
  onRegenerate: () => void;
}

export default function AssistantMessage({
  message,
  title,
  copied,
  onCopy,
  onDownload,
  onShare,
  onRegenerate,
}: AssistantMessageProps) {
  if (message.status === "loading") {
    return <ThinkingIndicator />;
  }

  if (message.status === "error") {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
        {message.content}
      </div>
    );
  }

  return (
    <Report
      title={title}
      evaluation={message.content}
      onCopy={onCopy}
      onDownload={onDownload}
      onShare={onShare}
      onRegenerate={onRegenerate}
      copied={copied}
    />
  );
}
