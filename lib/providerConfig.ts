export type Provider = "openai" | "gemini";

const PROVIDER_KEY = "startup-evaluator-provider";
const API_KEY_KEY = "startup-evaluator-api-key";

export function isProvider(value: unknown): value is Provider {
  return value === "openai" || value === "gemini";
}

export function loadProvider(): Provider | "" {
  if (typeof window === "undefined") return "";

  try {
    const stored = window.localStorage.getItem(PROVIDER_KEY);
    return isProvider(stored) ? stored : "";
  } catch {
    return "";
  }
}

export function loadApiKey(): string {
  if (typeof window === "undefined") return "";

  try {
    return window.localStorage.getItem(API_KEY_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveProvider(provider: Provider | ""): void {
  if (typeof window === "undefined") return;

  try {
    if (provider) {
      window.localStorage.setItem(PROVIDER_KEY, provider);
    } else {
      window.localStorage.removeItem(PROVIDER_KEY);
    }
  } catch {
    // localStorage unavailable — selection just won't persist.
  }
}

export function saveApiKey(apiKey: string): void {
  if (typeof window === "undefined") return;

  try {
    if (apiKey) {
      window.localStorage.setItem(API_KEY_KEY, apiKey);
    } else {
      window.localStorage.removeItem(API_KEY_KEY);
    }
  } catch {
    // localStorage unavailable — key just won't persist.
  }
}
