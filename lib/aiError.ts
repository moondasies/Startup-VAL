import type { Provider } from "@/lib/providerConfig";

const PROVIDER_LABELS: Record<Provider, string> = {
  openai: "OpenAI",
  gemini: "Gemini",
};

const NETWORK_ERROR_CODES = new Set(["ENOTFOUND", "ECONNREFUSED", "ETIMEDOUT", "EAI_AGAIN"]);

export function extractStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;

  const err = error as Record<string, unknown>;
  if (typeof err.status === "number") return err.status;
  if (typeof err.statusCode === "number") return err.statusCode;

  if (err.response && typeof err.response === "object") {
    const response = err.response as Record<string, unknown>;
    if (typeof response.status === "number") return response.status;
  }

  return undefined;
}

function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as Record<string, unknown>;
  return typeof err.code === "string" && NETWORK_ERROR_CODES.has(err.code);
}

/**
 * Converts a raw provider SDK error into a safe, user-facing message.
 * Never forwards the original error message — some SDKs echo back partial
 * API key fragments in auth-failure text, so only status codes are used.
 */
export function toFriendlyErrorMessage(error: unknown, provider: Provider): string {
  const label = PROVIDER_LABELS[provider];
  const status = extractStatus(error);

  // OpenAI reports invalid keys as 401/403. Gemini's SDK reports them as a
  // 400 INVALID_ARGUMENT ("API key not valid") since key validation happens
  // before request validation — bad key is the only 400 this route can hit,
  // since the request body it sends is always well-formed.
  const isAuthError = status === 401 || status === 403 || (provider === "gemini" && status === 400);

  if (isAuthError) {
    return `Your ${label} API key appears to be invalid. Please check it and try again.`;
  }

  if (status === 429) {
    return `${label} rate limit reached. Please wait a moment and try again.`;
  }

  if (status !== undefined && status >= 500) {
    return `${label} is currently unavailable. Please try again shortly.`;
  }

  if (isNetworkError(error)) {
    return "Network error — please check your connection and try again.";
  }

  return `Failed to evaluate the idea using ${label}. Please verify your API key and try again.`;
}
