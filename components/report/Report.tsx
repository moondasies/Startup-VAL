"use client";

import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  DollarSign,
  Flag,
  HelpCircle,
  Lightbulb,
  Rocket,
  Target,
  TrendingUp,
} from "lucide-react";
import ReportHeader from "@/components/report/ReportHeader";
import SectionCard from "@/components/report/SectionCard";
import InsightCard from "@/components/report/InsightCard";
import CollapsibleSection from "@/components/report/CollapsibleSection";
import ScoreBar from "@/components/report/ScoreBar";
import EvaluationCard from "@/components/EvaluationCard";
import { parseEvaluationReport } from "@/lib/parseReport";

interface ReportProps {
  title: string;
  evaluation: string;
  onCopy: () => void;
  onDownload: () => void;
  onShare: () => void;
  onRegenerate: () => void;
  copied: boolean;
}

const DECISION_STYLES: Record<
  NonNullable<ReturnType<typeof parseEvaluationReport>["investingVerdict"]["decision"]>,
  string
> = {
  YES: "bg-success/15 text-success",
  MAYBE: "bg-warning/15 text-warning",
  NO: "bg-danger/15 text-danger",
};

function estimateConfidence(
  parsed: ReturnType<typeof parseEvaluationReport>
): "High" | "Medium" | "Low" {
  let signals = 0;
  const total = 5;
  if (parsed.oneSentenceSummary) signals++;
  if (parsed.biggestStrength) signals++;
  if (parsed.biggestUnknown) signals++;
  if (parsed.investingVerdict.decision) signals++;
  if (parsed.scorecard.length >= 5) signals++;

  const ratio = signals / total;
  if (ratio >= 0.8) return "High";
  if (ratio >= 0.4) return "Medium";
  return "Low";
}

export default function Report({
  title,
  evaluation,
  onCopy,
  onDownload,
  onShare,
  onRegenerate,
  copied,
}: ReportProps) {
  const parsed = parseEvaluationReport(evaluation);
  const confidence = estimateConfidence(parsed);

  const isStructured =
    Boolean(parsed.oneSentenceSummary) ||
    Boolean(parsed.biggestStrength) ||
    Boolean(parsed.biggestUnknown) ||
    parsed.scorecard.length > 0 ||
    parsed.overallScore !== null;

  if (!isStructured) {
    return <EvaluationCard evaluation={evaluation} />;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <ReportHeader
        title={title}
        eyebrow="Investor Report"
        overallScore={parsed.overallScore}
        recommendation={parsed.recommendation}
        confidence={confidence}
        summary={parsed.verdictSentence}
        onCopy={onCopy}
        onDownload={onDownload}
        onShare={onShare}
        onRegenerate={onRegenerate}
        copied={copied}
      />

      {parsed.oneSentenceSummary && (
        <SectionCard icon={Target} title="Overview" delay={0.05}>
          <p>{parsed.oneSentenceSummary}</p>
        </SectionCard>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {parsed.biggestStrength && (
          <SectionCard
            icon={TrendingUp}
            title="Biggest Strength"
            delay={0.1}
            iconClassName="bg-success/15 text-success"
          >
            <p>{parsed.biggestStrength}</p>
          </SectionCard>
        )}

        {parsed.biggestUnknown && (
          <SectionCard
            icon={AlertCircle}
            title="Biggest Unknown"
            delay={0.15}
            iconClassName="bg-warning/15 text-warning"
          >
            <p>{parsed.biggestUnknown}</p>
          </SectionCard>
        )}
      </div>

      {parsed.investingVerdict.decision && (
        <SectionCard
          icon={DollarSign}
          title="Investor Opinion"
          delay={0.2}
          iconClassName="bg-secondary/15 text-secondary"
        >
          <span
            className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              DECISION_STYLES[parsed.investingVerdict.decision]
            }`}
          >
            {parsed.investingVerdict.decision}
          </span>
          <p>{parsed.investingVerdict.explanation}</p>
        </SectionCard>
      )}

      {parsed.roadmap.length > 0 && (
        <SectionCard
          icon={Rocket}
          title="Roadmap"
          delay={0.25}
          iconClassName="bg-primary/15 text-primary"
        >
          <div className="flex flex-col gap-4">
            {parsed.roadmap.map((phase, i) => (
              <div key={i}>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {phase.label}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {phase.items.map((item, j) => (
                    <InsightCard key={j} icon={CheckCircle2} text={item} tone="neutral" />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {(parsed.scorecard.length > 0 ||
        parsed.quickWins.length > 0 ||
        parsed.founderBlindSpots.length > 0 ||
        parsed.opportunitySnapshot.length > 0 ||
        parsed.factsVsAssumptions.facts.length > 0 ||
        parsed.factsVsAssumptions.assumptions.length > 0 ||
        parsed.factsVsAssumptions.unknowns.length > 0) && (
        <CollapsibleSection title="Detailed Analysis">
          <div className="flex flex-col gap-6">
            {parsed.scorecard.length > 0 && (
              <div className="flex flex-col gap-4">
                <p className="text-sm font-semibold text-text-primary">Scorecard</p>
                {parsed.scorecard.map((c, i) => (
                  <div key={i}>
                    <ScoreBar name={c.name} score={c.score} max={c.max} />
                    <div className="mt-1.5 flex flex-col gap-1 text-xs leading-relaxed text-text-muted">
                      {c.whatWorks && (
                        <p className="flex items-start gap-1.5">
                          <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-success" />
                          {c.whatWorks}
                        </p>
                      )}
                      {c.whatsMissing && (
                        <p className="flex items-start gap-1.5">
                          <AlertTriangle size={13} className="mt-0.5 shrink-0 text-warning" />
                          {c.whatsMissing}
                        </p>
                      )}
                      {c.nextAction && (
                        <p className="flex items-start gap-1.5">
                          <ArrowRight size={13} className="mt-0.5 shrink-0 text-primary" />
                          {c.nextAction}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {parsed.opportunitySnapshot.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold text-text-primary">
                  Opportunity Snapshot
                </p>
                <div className="overflow-hidden rounded-lg border border-border-subtle">
                  <table className="w-full text-left text-sm">
                    <tbody>
                      {parsed.opportunitySnapshot.map((row, i) => (
                        <tr key={i} className="border-b border-border-subtle last:border-0">
                          <td className="px-3 py-2 text-text-secondary">{row.category}</td>
                          <td className="px-3 py-2 text-text-primary">{row.rating}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {parsed.quickWins.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                  <Lightbulb size={14} className="text-warning" />
                  Quick Wins
                </p>
                <ul className="flex flex-col gap-2">
                  {parsed.quickWins.map((item, i) => (
                    <InsightCard key={i} icon={Lightbulb} text={item} tone="neutral" />
                  ))}
                </ul>
              </div>
            )}

            {parsed.founderBlindSpots.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                  <Brain size={14} className="text-secondary" />
                  Founder Blind Spots
                </p>
                <ul className="flex flex-col gap-2">
                  {parsed.founderBlindSpots.map((item, i) => (
                    <InsightCard key={i} icon={Brain} text={item} tone="neutral" />
                  ))}
                </ul>
              </div>
            )}

            {(parsed.factsVsAssumptions.facts.length > 0 ||
              parsed.factsVsAssumptions.assumptions.length > 0 ||
              parsed.factsVsAssumptions.unknowns.length > 0) && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                  <HelpCircle size={14} className="text-primary" />
                  Facts vs Assumptions
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Facts
                    </p>
                    <ul className="flex flex-col gap-1.5">
                      {parsed.factsVsAssumptions.facts.map((item, i) => (
                        <InsightCard key={i} icon={CheckCircle2} text={item} tone="positive" />
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Assumptions
                    </p>
                    <ul className="flex flex-col gap-1.5">
                      {parsed.factsVsAssumptions.assumptions.map((item, i) => (
                        <InsightCard key={i} icon={HelpCircle} text={item} tone="neutral" />
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Unknowns
                    </p>
                    <ul className="flex flex-col gap-1.5">
                      {parsed.factsVsAssumptions.unknowns.map((item, i) => (
                        <InsightCard key={i} icon={Flag} text={item} tone="negative" />
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}
