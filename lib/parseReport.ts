export type RecommendationLevel = "strong" | "improve" | "validate" | "not-recommended";

export interface Recommendation {
  label: string;
  level: RecommendationLevel;
}

export interface ScorecardCategory {
  name: string;
  score: number;
  max: number;
  whatWorks: string;
  whatsMissing: string;
  nextAction: string;
}

export interface OpportunityRow {
  category: string;
  rating: string;
}

export interface RoadmapPhase {
  label: string;
  items: string[];
}

export interface FactsAssumptions {
  facts: string[];
  assumptions: string[];
  unknowns: string[];
}

export interface InvestingVerdict {
  decision: "YES" | "MAYBE" | "NO" | null;
  explanation: string;
}

export interface ParsedReport {
  overallScore: number | null;
  recommendation: Recommendation | null;
  verdictSentence: string;
  oneSentenceSummary: string;
  biggestStrength: string;
  biggestUnknown: string;
  investingVerdict: InvestingVerdict;
  opportunitySnapshot: OpportunityRow[];
  scorecard: ScorecardCategory[];
  founderBlindSpots: string[];
  quickWins: string[];
  roadmap: RoadmapPhase[];
  factsVsAssumptions: FactsAssumptions;
  raw: string;
}

const RECOMMENDATION_EMOJIS: {
  emoji: string;
  level: RecommendationLevel;
  fallbackLabel: string;
}[] = [
  { emoji: "🟢", level: "strong", fallbackLabel: "Strong Opportunity" },
  { emoji: "🟡", level: "improve", fallbackLabel: "Promising but Needs Validation" },
  { emoji: "🟠", level: "validate", fallbackLabel: "High Risk" },
  { emoji: "🔴", level: "not-recommended", fallbackLabel: "Not Investment Ready" },
];

function stripHorizontalRules(text: string): string {
  return text
    .split("\n")
    .filter((line) => !/^\s*-{3,}\s*$/.test(line))
    .join("\n")
    .trim();
}

function splitTopSections(markdown: string): Map<string, string> {
  const sections = new Map<string, string>();
  const regex = /^#\s+(.+)$/gm;
  const matches = [...markdown.matchAll(regex)];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const heading = normalizeHeading(match[1]);
    const start = (match.index ?? 0) + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index ?? markdown.length : markdown.length;
    sections.set(heading, stripHorizontalRules(markdown.slice(start, end)));
  }

  return sections;
}

function normalizeHeading(raw: string): string {
  return raw
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .toLowerCase();
}

function extractBullets(content: string): string[] {
  const bulletRegex = /^\s*(?:[-*]|\d+[.)])\s+(.*)$/gm;
  const bullets: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = bulletRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text) bullets.push(text);
  }

  if (bullets.length > 0) return bullets;

  return content
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^#{1,6}\s/.test(l) && !/^-{3,}$/.test(l));
}

function extractOverallScore(content: string): number | null {
  const match = content.match(/(\d{1,3})\s*\/\s*100/);
  return match ? Math.min(100, parseInt(match[1], 10)) : null;
}

function extractRecommendation(content: string): Recommendation | null {
  for (const r of RECOMMENDATION_EMOJIS) {
    const idx = content.indexOf(r.emoji);
    if (idx === -1) continue;

    const rest = content.slice(idx + r.emoji.length);
    const line = (rest.match(/^[^\n]*/)?.[0] ?? "")
      .replace(/[—–-].*$/, "")
      .replace(/^[:\s]+/, "")
      .trim();

    return { label: line || r.fallbackLabel, level: r.level };
  }
  return null;
}

function extractVerdictSentence(content: string): string {
  const emojis = RECOMMENDATION_EMOJIS.map((r) => r.emoji);
  const lines = content
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const remaining = lines.filter(
    (l) =>
      !/overall score/i.test(l) &&
      !/^recommendation/i.test(l) &&
      !/^\d{1,3}\s*\/\s*100/.test(l) &&
      !emojis.some((e) => l.includes(e))
  );

  return remaining.join(" ").trim();
}

interface MarkerDef {
  key: string;
  regex: RegExp;
}

function extractByMarkers(text: string, markers: MarkerDef[]): Record<string, string> {
  const found: { key: string; idx: number; len: number }[] = [];

  for (const { key, regex } of markers) {
    const m = regex.exec(text);
    if (m) found.push({ key, idx: m.index, len: m[0].length });
  }

  found.sort((a, b) => a.idx - b.idx);

  const result: Record<string, string> = {};
  for (let i = 0; i < found.length; i++) {
    const start = found[i].idx + found[i].len;
    const end = i + 1 < found.length ? found[i + 1].idx : text.length;
    result[found[i].key] = text
      .slice(start, end)
      .replace(/^[:\s]+/, "")
      .trim();
  }

  return result;
}

function extractInvestingVerdict(content: string): InvestingVerdict {
  const match = content.match(/\b(YES|MAYBE|NO)\b/);
  const decision = (match?.[1] as InvestingVerdict["decision"]) ?? null;

  const explanation = content
    .replace(/\b(YES|MAYBE|NO)\b[\s:.\-—–]*/, "")
    .replace(/\n+/g, " ")
    .trim();

  return { decision, explanation };
}

function extractOpportunitySnapshot(content: string): OpportunityRow[] {
  const rows: OpportunityRow[] = [];
  const lines = content.split(/\n+/).map((l) => l.trim()).filter((l) => l.startsWith("|"));

  for (const line of lines) {
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (cells.length < 2) continue;
    if (/^-+$/.test(cells[0].replace(/\s/g, ""))) continue;
    if (/^category$/i.test(cells[0])) continue;

    rows.push({ category: cells[0], rating: cells[1] });
  }

  return rows;
}

function extractScorecard(content: string): ScorecardCategory[] {
  const categories: ScorecardCategory[] = [];
  const headingRegex = /^###\s+(.+)$/gm;
  const matches = [...content.matchAll(headingRegex)];

  const markers: MarkerDef[] = [
    { key: "whatWorks", regex: /✅\s*(?:\*\*)?What works(?:\*\*)?:?/i },
    { key: "whatsMissing", regex: /⚠️?\s*(?:\*\*)?What'?s missing(?:\*\*)?:?/i },
    { key: "nextAction", regex: /➡️?\s*(?:\*\*)?Next action(?:\*\*)?:?/i },
  ];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const name = match[1].trim();
    const start = (match.index ?? 0) + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index ?? content.length : content.length;
    const block = content.slice(start, end);

    const scoreMatch = block.match(/(\d{1,3})\s*\/\s*(\d{1,3})/);
    if (!scoreMatch) continue;

    const fields = extractByMarkers(block, markers);

    categories.push({
      name,
      score: parseInt(scoreMatch[1], 10),
      max: parseInt(scoreMatch[2], 10),
      whatWorks: fields.whatWorks ?? "",
      whatsMissing: fields.whatsMissing ?? "",
      nextAction: fields.nextAction ?? "",
    });
  }

  return categories;
}

function extractRoadmap(content: string): RoadmapPhase[] {
  const phaseRegex = /\*{0,2}(Week\s*\d+|Month\s*\d+\+?)\*{0,2}\s*:?/gi;
  const matches = [...content.matchAll(phaseRegex)];

  const phases: RoadmapPhase[] = [];
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const label = match[1].replace(/\s+/g, " ").trim();
    const start = (match.index ?? 0) + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index ?? content.length : content.length;
    const items = extractBullets(content.slice(start, end));

    if (items.length > 0) phases.push({ label, items });
  }

  return phases;
}

function extractFactsVsAssumptions(content: string): FactsAssumptions {
  const sections = new Map<string, string>();
  const regex = /^##\s+(.+)$/gm;
  const matches = [...content.matchAll(regex)];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const heading = normalizeHeading(match[1]);
    const start = (match.index ?? 0) + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index ?? content.length : content.length;
    sections.set(heading, stripHorizontalRules(content.slice(start, end)));
  }

  return {
    facts: extractBullets(sections.get("facts") ?? ""),
    assumptions: extractBullets(sections.get("assumptions") ?? ""),
    unknowns: extractBullets(sections.get("unknowns") ?? ""),
  };
}

export function parseEvaluationReport(markdown: string): ParsedReport {
  const sections = splitTopSections(markdown);

  const verdictContent = sections.get("startup verdict") ?? "";
  const overallScore = extractOverallScore(verdictContent);
  const recommendation = extractRecommendation(verdictContent);
  const verdictSentence = extractVerdictSentence(verdictContent);

  const oneSentenceSummary = sections.get("startup in one sentence") ?? "";
  const biggestStrength = sections.get("biggest strength") ?? "";
  const biggestUnknown = sections.get("biggest unknown") ?? "";

  const investingVerdict = extractInvestingVerdict(
    sections.get("if i were investing today") ?? ""
  );

  const opportunitySnapshot = extractOpportunitySnapshot(
    sections.get("opportunity snapshot") ?? ""
  );

  const scorecard = extractScorecard(sections.get("scorecard") ?? "");

  const founderBlindSpots = extractBullets(sections.get("founder blind spots") ?? "");
  const quickWins = extractBullets(sections.get("quick wins") ?? "");
  const roadmap = extractRoadmap(sections.get("recommended next steps") ?? "");
  const factsVsAssumptions = extractFactsVsAssumptions(
    sections.get("facts vs assumptions") ?? ""
  );

  return {
    overallScore,
    recommendation,
    verdictSentence,
    oneSentenceSummary,
    biggestStrength,
    biggestUnknown,
    investingVerdict,
    opportunitySnapshot,
    scorecard,
    founderBlindSpots,
    quickWins,
    roadmap,
    factsVsAssumptions,
    raw: markdown,
  };
}
