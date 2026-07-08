/**
 * Regional hourly rate ranges (USD) and project-type base hours.
 * These are starting points based on common freelance market rates —
 * tune them to your own positioning and track record.
 */

export type Region = "pakistan" | "uae" | "us" | "uk" | "europe" | "other";

export interface RateRange {
  low: number;
  high: number;
  label: string;
}

export const RATE_CARD: Record<Region, RateRange> = {
  pakistan: { low: 8, high: 18, label: "Pakistan / local market" },
  uae: { low: 20, high: 35, label: "UAE / Gulf market" },
  us: { low: 35, high: 65, label: "United States" },
  uk: { low: 35, high: 60, label: "United Kingdom" },
  europe: { low: 30, high: 55, label: "Europe" },
  other: { low: 20, high: 35, label: "International (general)" },
};

export type ProjectType =
  | "landing-page"
  | "web-app"
  | "saas"
  | "ecommerce"
  | "mobile-app"
  | "api-backend"
  | "other";

/** Baseline architecture/setup hours before any features are added. */
export const BASE_HOURS: Record<ProjectType, number> = {
  "landing-page": 16,
  "web-app": 40,
  saas: 60,
  ecommerce: 50,
  "mobile-app": 70,
  "api-backend": 30,
  other: 30,
};

export type Complexity = "simple" | "medium" | "complex";

export const COMPLEXITY_MULTIPLIER: Record<Complexity, number> = {
  simple: 0.8,
  medium: 1.0,
  complex: 1.3,
};

/** Extra multiplier per additional platform beyond the first (web is assumed included). */
export const PLATFORM_MULTIPLIER: Record<string, number> = {
  web: 0,
  ios: 0.35,
  android: 0.35,
};
