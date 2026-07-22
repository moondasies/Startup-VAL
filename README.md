# Startup-VAL

**Evaluate your startup idea like a VC — powered by AI, delivered as a chat.**

Startup-VAL is a ChatGPT-style AI workspace where founders describe an idea and get back an investor-grade evaluation: overall score, recommendation, scorecard breakdown, biggest risks, and a concrete roadmap — all rendered as clean, structured cards inside a real multi-turn conversation.

## Features

- **Chat-native UX** — a permanently docked composer, growing conversation history, and inline "thinking" states, modeled after ChatGPT / Claude / Codex.
- **Bring your own API key** — no server-side API key required anywhere. Each visitor picks a provider (OpenAI or Gemini) and pastes their own key, stored only in their browser's `localStorage`.
- **Structured investor reports** — the AI's markdown response is parsed client-side into scannable cards: verdict, overview, strengths, biggest unknown, investor opinion, roadmap, and a collapsible detailed scorecard.
- **Multi-turn conversations** — keep refining the same idea in one thread; each submission starts a new chat only when you choose to.
- **Conversation history** — past evaluations are saved locally and listed in the sidebar, mobile-friendly with a collapsible drawer.
- **Dark, professional UI** — Tailwind CSS v4 with a custom color system, Inter font, Lucide icons, and Framer Motion micro-interactions.
- **No backend lock-in** — no database, no auth, no analytics, no required environment variables.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI | OpenAI API (`gpt-4o-mini`) or Google Gemini (`gemini-2.5-flash`) — user's choice, user's key |
| Markdown | `react-markdown` + `remark-gfm` |
| Icons | Lucide React |
| Animation | Framer Motion |

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Run the dev server**

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000), pick a provider (OpenAI or Gemini), paste your own API key, and describe a startup idea.

No `.env` file or environment variable setup is needed — the API key is entered in the UI and sent only to `/api/evaluate` for that one request.

## Project structure

```
app/
  api/evaluate/route.ts     # POST endpoint — accepts { provider, apiKey, idea }, calls OpenAI or Gemini
  layout.tsx                # Root layout, Inter font
  page.tsx                  # Chat workspace: conversation + provider/key state, layout orchestration
  globals.css                # Dark theme color system (Tailwind v4 @theme)

components/
  chat/
    ProviderConfig.tsx        # Provider dropdown + password-style API key input (show/hide)
    PromptInput.tsx           # Auto-growing composer, Enter to send / Shift+Enter for newline
    UserMessage.tsx           # User chat bubble
    AssistantMessage.tsx      # Renders loading / error / structured report per turn
    ThinkingIndicator.tsx     # Rotating "Analyzing startup..." status
    EmptyState.tsx            # Landing state with example idea chips
  report/
    Report.tsx                # Assembles the full structured evaluation
    ReportHeader.tsx          # Score, recommendation badge, confidence
    ScoreBar.tsx               # Animated per-category score bars
    SectionCard.tsx            # Overview / Strengths / Roadmap cards
    CollapsibleSection.tsx     # "Detailed Analysis" (scorecard, blind spots, etc.)
  layout/
    Sidebar.tsx                # Conversation history, responsive drawer on mobile
    Topbar.tsx                 # Share / Export / Regenerate

lib/
  openai.ts                  # Builds an OpenAI client from a user-supplied key (no env vars)
  gemini.ts                  # Builds a Gemini client from a user-supplied key (no env vars)
  aiError.ts                  # Maps provider SDK errors to safe, friendly messages
  providerConfig.ts           # Client-side localStorage helpers for provider + API key
  conversations.ts            # Chat/message data model + localStorage persistence
  parseReport.ts              # Parses the AI's markdown into structured report data

prompts/
  startupPrompt.ts           # The evaluation system prompt sent to the model
```

## How evaluation works

1. The user picks a provider and enters their own API key in the UI; both are remembered in `localStorage` only.
2. On submit, the browser sends `{ provider, apiKey, idea }` to `app/api/evaluate/route.ts`.
3. The route builds a client for the selected provider using the request's `apiKey` — never `process.env` — and sends `prompts/startupPrompt.ts` plus the idea as a single prompt.
4. The model returns a structured markdown report (verdict, scorecard, roadmap, etc.).
5. `lib/parseReport.ts` parses that markdown into typed data — no rendering logic touches raw markdown directly.
6. `components/report/Report.tsx` renders the parsed data as cards. If the response doesn't match the expected structure, it falls back to rendering the raw markdown so nothing ever breaks.

The API key is used only for that single request — it is never logged, never persisted server-side, and never echoed back in error messages.

## Deployment

Deployable on [Vercel](https://vercel.com) with **zero environment variables**:

1. Push this repo to GitHub.
2. Import it into Vercel.
3. Deploy — no project configuration needed.
4. Anyone who opens the deployed app selects a provider and pastes their own API key to use it.

## Notes

- No authentication, database, or analytics — intentionally out of scope.
- Conversation history, the selected provider, and the API key are all stored in the browser's `localStorage`, not on a server.
