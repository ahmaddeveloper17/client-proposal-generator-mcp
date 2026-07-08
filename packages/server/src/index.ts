#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { FEATURE_CATALOG } from "./data/featureCatalog.js";
import {
  type ProposalInput,
  buildMilestones,
  estimate,
  recommendTechStack,
} from "./logic/estimator.js";
import { buildProposalDocument } from "./logic/proposalBuilder.js";

const server = new McpServer({
  name: "proposal-generator-mcp",
  version: "1.0.0",
});

// Shared input shape used by every tool below.
const proposalInputShape = {
  clientName: z.string().describe("The client or company's name"),
  projectName: z.string().optional().describe("Optional project/product name"),
  projectType: z
    .enum(["landing-page", "web-app", "saas", "ecommerce", "mobile-app", "api-backend", "other"])
    .describe("The overall category of project"),
  features: z
    .array(z.string())
    .describe(
      `Feature keys the client needs. Recognized keys: ${Object.keys(FEATURE_CATALOG).join(
        ", ",
      )}. Unrecognized strings are still included with a conservative default estimate.`,
    ),
  complexity: z
    .enum(["simple", "medium", "complex"])
    .optional()
    .describe("Overall project complexity. Defaults to 'medium'."),
  platforms: z
    .array(z.enum(["web", "ios", "android"]))
    .optional()
    .describe("Target platforms. Defaults to ['web']."),
  designNeeds: z
    .enum(["none", "basic", "custom-design-system"])
    .optional()
    .describe("How much custom design work is needed. Defaults to 'basic'."),
  region: z
    .enum(["pakistan", "uae", "us", "uk", "europe", "other"])
    .optional()
    .describe("Client's market, used to pick a realistic rate range. Defaults to 'us'."),
  weeklyCapacityHours: z
    .number()
    .optional()
    .describe("Your available hours per week for this project. Defaults to 25."),
  budgetHint: z
    .number()
    .optional()
    .describe("Client's stated budget, if known (for reference only)"),
  deadlineHint: z
    .string()
    .optional()
    .describe("Client's stated deadline, if known (for reference only)"),
  additionalNotes: z.string().optional().describe("Any extra context to include in the proposal"),
};

const proposalInputSchema = z.object(proposalInputShape);

function toInput(args: z.infer<typeof proposalInputSchema>): ProposalInput {
  return args as ProposalInput;
}

server.registerTool(
  "generate_proposal",
  {
    title: "Generate Full Proposal",
    description:
      "Takes client requirements and returns a complete proposal: tech stack, timeline, price estimate, milestones, and a ready-to-send Markdown proposal document.",
    inputSchema: proposalInputShape,
  },
  async (args) => {
    const input = toInput(args);
    const est = estimate(input);
    const techStack = recommendTechStack(input, est);
    const milestones = buildMilestones(est);
    const document = buildProposalDocument(input, est, techStack, milestones);

    const summary = {
      client: input.clientName,
      project: input.projectName ?? null,
      techStack,
      timeline: est.timelineWeeks,
      totalHours: est.totalHours,
      rateRange: { low: est.rate.low, high: est.rate.high, region: est.rate.region },
      priceEstimate: est.price,
      milestones: milestones.map((m) => ({
        name: m.name,
        durationWeeks: m.durationWeeks,
        paymentPercent: Math.round(m.percentOfPayment * 100),
        paymentRange: [m.paymentLow, m.paymentHigh],
      })),
      unrecognizedFeatures: est.unrecognizedFeatures,
    };

    return {
      content: [
        { type: "text", text: JSON.stringify(summary, null, 2) },
        { type: "text", text: document },
      ],
    };
  },
);

server.registerTool(
  "estimate_price_and_timeline",
  {
    title: "Estimate Price & Timeline",
    description:
      "Quick estimate only — total hours, price range, and timeline range, without generating the full document. Useful for fast back-of-envelope quoting.",
    inputSchema: proposalInputShape,
  },
  async (args) => {
    const input = toInput(args);
    const est = estimate(input);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              totalHours: est.totalHours,
              timelineWeeks: est.timelineWeeks,
              rateRange: est.rate,
              priceEstimate: est.price,
              unrecognizedFeatures: est.unrecognizedFeatures,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

server.registerTool(
  "recommend_tech_stack",
  {
    title: "Recommend Tech Stack",
    description: "Suggests a tech stack based on project type and requested features.",
    inputSchema: proposalInputShape,
  },
  async (args) => {
    const input = toInput(args);
    const est = estimate(input);
    const techStack = recommendTechStack(input, est);
    return { content: [{ type: "text", text: JSON.stringify({ techStack }, null, 2) }] };
  },
);

server.registerTool(
  "list_feature_catalog",
  {
    title: "List Feature Catalog",
    description:
      "Lists every recognized feature key, its estimated hours, and category — use this to see what keys are valid input for the 'features' field on other tools.",
    inputSchema: {},
  },
  async () => {
    return { content: [{ type: "text", text: JSON.stringify(FEATURE_CATALOG, null, 2) }] };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Proposal Generator MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});
