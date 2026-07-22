interface UserMessageProps {
  content: string;
}

export default function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl bg-primary/15 px-4 py-2.5 text-sm leading-relaxed text-text-primary">
        {content}
      </div>
    </div>
  );
}
