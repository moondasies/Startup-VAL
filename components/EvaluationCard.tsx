"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

interface EvaluationCardProps {
  evaluation: string;
}

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-text-primary mt-6 mb-3 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-semibold text-text-primary mt-6 mb-2 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-text-primary mt-4 mb-2">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-text-secondary leading-relaxed mb-3">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 mb-3 space-y-1 text-text-secondary">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 mb-3 space-y-1 text-text-secondary">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-text-primary">{children}</strong>
  ),
  code: ({ children }) => (
    <code className="rounded bg-surface-hover px-1.5 py-0.5 text-sm text-primary">
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-primary/40 pl-4 italic text-text-secondary mb-3">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-border-subtle" />,
  table: ({ children }) => (
    <div className="overflow-x-auto mb-3">
      <table className="w-full border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-border-subtle">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 font-semibold text-text-primary">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 border-b border-border-subtle text-text-secondary">
      {children}
    </td>
  ),
};

export default function EvaluationCard({ evaluation }: EvaluationCardProps) {
  return (
    <div className="w-full rounded-xl border border-border-subtle bg-surface shadow-sm overflow-hidden">
      <div className="border-b border-border-subtle px-6 py-4">
        <h2 className="text-sm font-semibold text-text-primary">Evaluation Report</h2>
      </div>
      <div className="px-6 py-6">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {evaluation}
        </ReactMarkdown>
      </div>
    </div>
  );
}
