# Startup-VAL

**Evaluate your startup idea like a VC — powered by AI, delivered as a chat.**

Startup-VAL is a ChatGPT-style AI workspace where founders describe an idea and get back an investor-grade evaluation: overall score, recommendation, scorecard breakdown, biggest risks, and a concrete roadmap — all rendered as clean, structured cards inside a real multi-turn conversation.
Live link : https://startup-idea-validator-liart.vercel.app/
## Features

- **Chat-native UX** — a permanently docked composer, growing conversation history, and inline "thinking" states, modeled after ChatGPT / Claude / Codex.
- **Structured investor reports** — the AI's markdown response is parsed client-side into scannable cards: verdict, overview, strengths, biggest unknown, investor opinion, roadmap, and a collapsible detailed scorecard.
- **Multi-turn conversations** — keep refining the same idea in one thread; each submission starts a new chat only when you choose to.
- **Conversation history** — past evaluations are saved locally and listed in the sidebar, mobile-friendly with a collapsible drawer.
- **Dark, professional UI** — Tailwind CSS v4 with a custom color system, Inter font, Lucide icons, and Framer Motion micro-interactions.
- **No backend lock-in** — no database, no auth, no analytics. Just Next.js API routes talking to OpenAI.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI | OpenAI API (`gpt-4o-mini`) |
| Markdown | `react-markdown` + `remark-gfm` |
| Icons | Lucide React |
| Animation | Framer Motion |

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set your OpenAI API key**

   ```bash
   cp .env.local.example .env.local
   ```

   Then open `.env.local` and set:

   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Run the dev server**

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) and describe a startup idea.

## Project structure

```
app/
  api/evaluate/route.ts     # POST endpoint — builds the prompt and calls OpenAI
  layout.tsx                # Root layout, Inter font
  page.tsx                  # Chat workspace: conversation state, layout orchestration
  globals.css                # Dark theme color system (Tailwind v4 @theme)

components/
  chat/
    PromptInput.tsx          # Auto-growing composer, Enter to send / Shift+Enter for newline
    UserMessage.tsx          # User chat bubble
    AssistantMessage.tsx     # Renders loading / error / structured report per turn
    ThinkingIndicator.tsx    # Rotating "Analyzing startup..." status
    EmptyState.tsx           # Landing state with example idea chips
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
  openai.ts                  # OpenAI client, reads OPENAI_API_KEY from env
  conversations.ts           # Chat/message data model + localStorage persistence
  parseReport.ts             # Parses the AI's markdown into structured report data

prompts/
  startupPrompt.ts           # The evaluation system prompt sent to OpenAI
```

## How evaluation works

1. The user's message is appended to `prompts/startupPrompt.ts` and sent to OpenAI as a single prompt.
2. The model returns a structured markdown report (verdict, scorecard, roadmap, etc.).
3. `lib/parseReport.ts` parses that markdown into typed data — no rendering logic touches raw markdown directly.
4. `components/report/Report.tsx` renders the parsed data as cards. If the response doesn't match the expected structure, it falls back to rendering the raw markdown so nothing ever breaks.

## Deployment

Deployable on [Vercel](https://vercel.com) as-is:

1. Push this repo to GitHub.
2. Import it into Vercel.
3. Set `OPENAI_API_KEY` in the project's environment variables.
4. Deploy.

## Notes

- No authentication, database, or analytics — intentionally out of scope.
- Conversation history is stored in the browser's `localStorage`, not on a server.
