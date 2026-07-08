import type { EstimateResult, Milestone, ProposalInput } from "./estimator.js";

function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

function fmtWeeks(w: { low: number; high: number }): string {
  if (w.low === w.high) return `${w.low} week${w.high === 1 ? "" : "s"}`;
  return `${w.low}–${w.high} weeks`;
}

export function buildProposalDocument(
  input: ProposalInput,
  est: EstimateResult,
  techStack: string[],
  milestones: Milestone[],
): string {
  const projectName = input.projectName ?? `${input.clientName} Project`;
  const today = new Date().toISOString().slice(0, 10);

  const featureLines = est.recognizedFeatures
    .map((f) => `- **${f.label}**`)
    .concat(
      est.unrecognizedFeatures.map((f) => `- **${f}** *(custom scope — estimated conservatively)*`),
    )
    .join("\n");

  const techLines = techStack.map((t) => `- ${t}`).join("\n");

  const milestoneRows = milestones
    .map(
      (m, i) =>
        `| ${i + 1} | ${m.name} | ${m.durationWeeks}w | ${Math.round(
          m.percentOfPayment * 100,
        )}% | ${fmtMoney(m.paymentLow)}–${fmtMoney(m.paymentHigh)} |`,
    )
    .join("\n");

  return `# Project Proposal: ${projectName}

**Prepared for:** ${input.clientName}
**Date:** ${today}

---

## 1. Project Overview

This proposal outlines the scope, timeline, technology approach, and investment required to deliver **${projectName}**${
    input.additionalNotes ? `. ${input.additionalNotes}` : "."
  }

## 2. Scope of Work

${featureLines || "- Core application build (no additional features specified)"}

## 3. Recommended Tech Stack

${techLines}

## 4. Timeline

Estimated delivery: **${fmtWeeks(est.timelineWeeks)}** (~${est.totalHours} development hours), assuming ~${
    est.weeklyCapacityHours
  } focused hours/week.

${input.deadlineHint ? `> Client target: ${input.deadlineHint}\n` : ""}

## 5. Milestones & Payment Schedule

| # | Milestone | Duration | Payment | Amount |
|---|-----------|----------|---------|--------|
${milestoneRows}

## 6. Investment

| | |
|---|---|
| Estimated hours | ${est.totalHours} |
| Rate range | $${est.rate.low}–$${est.rate.high}/hr |
| **Total estimate** | **${fmtMoney(est.price.low)} – ${fmtMoney(est.price.high)}** |

*This is a good-faith estimate based on the requirements described. Significant scope changes will be discussed and quoted separately before work begins.*

## 7. Next Steps

1. Review and confirm scope in this proposal.
2. Sign off and pay the first milestone (Discovery & Planning) to begin.
3. Kickoff call to align on timeline and communication cadence.

---

*Prepared by [Your Name] — [your email / portfolio link]*
`;
}
