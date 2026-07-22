import { NextRequest, NextResponse } from "next/server";
import { createOpenAIClient } from "@/lib/openai";
import { createGeminiClient } from "@/lib/gemini";
import { STARTUP_PROMPT } from "@/prompts/startupPrompt";
import { isProvider, type Provider } from "@/lib/providerConfig";
import { extractStatus, toFriendlyErrorMessage } from "@/lib/aiError";

const OPENAI_MODEL = "gpt-4o-mini";
const GEMINI_MODEL = "gemini-2.5-flash";

async function evaluateWithOpenAI(apiKey: string, prompt: string): Promise<string> {
  const client = createOpenAIClient(apiKey);

  const completion = await client.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0]?.message?.content ?? "";
}

async function evaluateWithGemini(apiKey: string, prompt: string): Promise<string> {
  const client = createGeminiClient(apiKey);

  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });

  return response.text ?? "";
}

export async function POST(request: NextRequest) {
  let provider: unknown;
  let apiKey: unknown;
  let idea: unknown;

  try {
    const body = await request.json();
    provider = body?.provider;
    apiKey = body?.apiKey;
    idea = body?.idea;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isProvider(provider)) {
    return NextResponse.json({ error: "Select an AI provider." }, { status: 400 });
  }

  if (typeof apiKey !== "string" || apiKey.trim().length === 0) {
    return NextResponse.json({ error: "Please enter your API key." }, { status: 400 });
  }

  if (typeof idea !== "string" || idea.trim().length === 0) {
    return NextResponse.json(
      { error: "Please provide a non-empty 'idea' string." },
      { status: 400 }
    );
  }

  const prompt = `${STARTUP_PROMPT}\n\nStartup Idea:\n${idea}`;

  try {
    const evaluation =
      provider === "openai"
        ? await evaluateWithOpenAI(apiKey, prompt)
        : await evaluateWithGemini(apiKey, prompt);

    return NextResponse.json({ evaluation });
  } catch (error) {
    // Never log the raw error: some provider SDKs echo back partial API key
    // fragments in auth-failure messages. Only a status code is safe to log.
    console.error("Evaluation failed", {
      provider: provider as Provider,
      status: extractStatus(error) ?? null,
    });

    return NextResponse.json(
      { error: toFriendlyErrorMessage(error, provider as Provider) },
      { status: 502 }
    );
  }
}
