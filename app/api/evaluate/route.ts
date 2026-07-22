import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { STARTUP_PROMPT } from "@/prompts/startupPrompt";

export async function POST(request: NextRequest) {
  let idea: unknown;

  try {
    const body = await request.json();
    idea = body?.idea;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  if (typeof idea !== "string" || idea.trim().length === 0) {
    return NextResponse.json(
      { error: "Please provide a non-empty 'idea' string." },
      { status: 400 }
    );
  }

  try {
    const openai = getOpenAIClient();

    const prompt = `${STARTUP_PROMPT}\n\nStartup Idea:\n${idea}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const evaluation = completion.choices[0]?.message?.content ?? "";

    return NextResponse.json({ evaluation });
  } catch (error) {
    console.error("Error evaluating startup idea:", error);
    return NextResponse.json(
      { error: "Failed to evaluate the idea. Please try again." },
      { status: 500 }
    );
  }
}
