import { FEATURE_CATALOG, type FeatureDefinition } from "../data/featureCatalog.js";
import {
  BASE_HOURS,
  COMPLEXITY_MULTIPLIER,
  type Complexity,
  PLATFORM_MULTIPLIER,
  type ProjectType,
  RATE_CARD,
  type Region,
} from "../data/rateCards.js";

export interface ProposalInput {
  clientName: string;
  projectName?: string;
  projectType: ProjectType;
  features: string[];
  complexity?: Complexity;
  platforms?: string[];
  designNeeds?: "none" | "basic" | "custom-design-system";
  region?: Region;
  weeklyCapacityHours?: number;
  budgetHint?: number;
  deadlineHint?: string;
  additionalNotes?: string;
}

export interface RecognizedFeature extends FeatureDefinition {
  key: string;
}

export interface EstimateResult {
  recognizedFeatures: RecognizedFeature[];
  unrecognizedFeatures: string[];
  baseHours: number;
  featureHours: number;
  complexityMultiplier: number;
  platformSurchargeHours: number;
  totalHours: number;
  weeklyCapacityHours: number;
  timelineWeeks: { low: number; high: number };
  rate: { low: number; high: number; region: Region };
  price: { low: number; high: number };
}

/** Round to the nearest 0.5 week / whole dollar for cleaner client-facing numbers. */
const roundWeeks = (n: number) => Math.max(1, Math.ceil(n * 2) / 2);
const roundPrice = (n: number) => Math.round(n / 10) * 10;

export function estimate(input: ProposalInput): EstimateResult {
  const region = input.region ?? "us";
  const complexity = input.complexity ?? "medium";
  const platforms = input.platforms?.length ? input.platforms : ["web"];
  const weeklyCapacityHours = input.weeklyCapacityHours ?? 25;

  const recognizedFeatures: RecognizedFeature[] = [];
  const unrecognizedFeatures: string[] = [];

  for (const key of input.features) {
    const def = FEATURE_CATALOG[key];
    if (def) {
      recognizedFeatures.push({ key, ...def });
    } else {
      unrecognizedFeatures.push(key);
    }
  }

  // Unrecognized features still cost time — assume a conservative default
  // rather than silently ignoring what the client asked for.
  const UNRECOGNIZED_FEATURE_HOURS = 12;

  const baseHours = BASE_HOURS[input.projectType];
  const featureHours =
    recognizedFeatures.reduce((sum, f) => sum + f.hours, 0) +
    unrecognizedFeatures.length * UNRECOGNIZED_FEATURE_HOURS;

  const designHours =
    input.designNeeds === "custom-design-system"
      ? FEATURE_CATALOG["custom-design-system"].hours
      : input.designNeeds === "basic"
        ? 8
        : 0;

  const preMultiplierHours = baseHours + featureHours + designHours;
  const complexityMultiplier = COMPLEXITY_MULTIPLIER[complexity];

  const platformSurchargeHours = platforms
    .filter((p) => p !== "web")
    .reduce((sum, p) => sum + preMultiplierHours * (PLATFORM_MULTIPLIER[p] ?? 0), 0);

  const totalHours = Math.round(preMultiplierHours * complexityMultiplier + platformSurchargeHours);

  const rate = { ...RATE_CARD[region], region };
  const price = {
    low: roundPrice(totalHours * rate.low),
    high: roundPrice(totalHours * rate.high),
  };

  const timelineWeeks = {
    low: roundWeeks(totalHours / (weeklyCapacityHours * 1.3)), // best case, higher focus
    high: roundWeeks(totalHours / weeklyCapacityHours),
  };

  return {
    recognizedFeatures,
    unrecognizedFeatures,
    baseHours,
    featureHours: featureHours + designHours,
    complexityMultiplier,
    platformSurchargeHours: Math.round(platformSurchargeHours),
    totalHours,
    weeklyCapacityHours,
    timelineWeeks,
    rate: { low: rate.low, high: rate.high, region },
    price,
  };
}

export interface Milestone {
  name: string;
  description: string;
  percentOfTimeline: number;
  percentOfPayment: number;
  durationWeeks: number;
  paymentLow: number;
  paymentHigh: number;
}

const MILESTONE_TEMPLATE = [
  {
    name: "Discovery & Planning",
    description:
      "Finalize requirements, information architecture, and technical approach. Confirm scope and success criteria.",
    percentOfTimeline: 0.1,
    percentOfPayment: 0.2,
  },
  {
    name: "Design & Prototyping",
    description:
      "UI/UX design system, key screens, and an interactive prototype signed off before development begins.",
    percentOfTimeline: 0.15,
    percentOfPayment: 0.15,
  },
  {
    name: "Core Development — Phase 1",
    description:
      "Backend foundation, data models, authentication, and the highest-priority features built and demoed.",
    percentOfTimeline: 0.3,
    percentOfPayment: 0.25,
  },
  {
    name: "Core Development — Phase 2",
    description:
      "Remaining features implemented, frontend/backend fully integrated, edge cases handled.",
    percentOfTimeline: 0.25,
    percentOfPayment: 0.2,
  },
  {
    name: "Testing & QA",
    description:
      "Cross-browser/device testing, bug fixes, performance pass, and client review round.",
    percentOfTimeline: 0.1,
    percentOfPayment: 0.1,
  },
  {
    name: "Deployment & Handover",
    description:
      "Production deployment, documentation, and a walkthrough/training session. Warranty period begins.",
    percentOfTimeline: 0.1,
    percentOfPayment: 0.1,
  },
];

export function buildMilestones(estimateResult: EstimateResult): Milestone[] {
  const { timelineWeeks, price } = estimateResult;
  return MILESTONE_TEMPLATE.map((m) => ({
    name: m.name,
    description: m.description,
    percentOfTimeline: m.percentOfTimeline,
    percentOfPayment: m.percentOfPayment,
    durationWeeks: Math.max(0.5, Math.round(timelineWeeks.high * m.percentOfTimeline * 2) / 2),
    paymentLow: Math.round(price.low * m.percentOfPayment),
    paymentHigh: Math.round(price.high * m.percentOfPayment),
  }));
}

export function recommendTechStack(input: ProposalInput, estimateResult: EstimateResult): string[] {
  const stack = new Set<string>();

  // Sensible defaults for a MERN/Next.js-oriented freelancer.
  stack.add("Next.js (React) — frontend & API routes");
  stack.add("TypeScript");
  stack.add("Tailwind CSS");
  stack.add("Node.js / Express — backend services (if separate from Next.js API routes)");
  stack.add("MongoDB — primary database");

  if (input.projectType === "mobile-app") {
    stack.add("React Native — cross-platform mobile app");
  }
  if (input.projectType === "saas" || input.projectType === "ecommerce") {
    stack.add("PostgreSQL — consider if relational integrity matters (orders, billing)");
  }

  for (const feature of estimateResult.recognizedFeatures) {
    for (const t of feature.tech) stack.add(t);
  }

  if (input.designNeeds === "custom-design-system") {
    stack.add("Storybook — component documentation & design system review");
  }

  stack.add("Vercel — hosting & deployment");
  stack.add("GitHub — version control & CI");

  return Array.from(stack);
}
