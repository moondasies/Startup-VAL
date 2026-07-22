"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { Provider } from "@/lib/providerConfig";

interface ProviderConfigProps {
  provider: Provider | "";
  apiKey: string;
  onProviderChange: (provider: Provider) => void;
  onApiKeyChange: (apiKey: string) => void;
  error: string | null;
}

const API_KEY_PLACEHOLDERS: Record<Provider, string> = {
  openai: "sk-...",
  gemini: "AIza...",
};

export default function ProviderConfig({
  provider,
  apiKey,
  onProviderChange,
  onApiKeyChange,
  error,
}: ProviderConfigProps) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          value={provider}
          onChange={(e) => onProviderChange(e.target.value as Provider)}
          aria-label="AI provider"
          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-text-primary focus:border-primary/60 focus:outline-none sm:w-36"
        >
          <option value="" disabled>
            Select provider
          </option>
          <option value="openai">OpenAI</option>
          <option value="gemini">Gemini</option>
        </select>

        <div className="relative flex-1">
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder={provider ? API_KEY_PLACEHOLDERS[provider] : "Your API key"}
            aria-label="API key"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 pr-9 text-sm text-text-primary placeholder:text-text-muted focus:border-primary/60 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            aria-label={showKey ? "Hide API key" : "Show API key"}
            className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center text-text-muted transition-colors hover:text-text-primary"
          >
            {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
