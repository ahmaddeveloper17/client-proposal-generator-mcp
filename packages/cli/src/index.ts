#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import {
  estimate,
  buildMilestones,
  recommendTechStack,
  buildProposalDocument,
} from "@dev_ahmad_org/proposal-generator/exports";
import type { ProposalInput } from "@dev_ahmad_org/proposal-generator/exports";
import { FEATURE_CATALOG as FEATURE_CATALOG_MAP } from "@dev_ahmad_org/proposal-generator/exports";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const program = new Command();

program
  .name("proposal-gen")
  .description("Generate freelancing proposals from the terminal")
  .version("1.0.0");

function buildArgs(args: Record<string, unknown>): ProposalInput {
  return {
    clientName: String(args.clientName ?? ""),
    projectName: args.projectName as string | undefined,
    projectType: args.projectType as ProposalInput["projectType"],
    features: (args.features as string[]) ?? [],
    complexity: args.complexity as ProposalInput["complexity"],
    platforms: args.platforms as string[] | undefined,
    designNeeds: args.designNeeds as ProposalInput["designNeeds"],
    region: args.region as ProposalInput["region"],
    weeklyCapacityHours: args.weeklyCapacityHours as number | undefined,
    budgetHint: args.budgetHint as number | undefined,
    deadlineHint: args.deadlineHint as string | undefined,
    additionalNotes: args.additionalNotes as string | undefined,
  };
}

function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

program
  .command("estimate")
  .description("Quick estimate — total hours, price range, and timeline")
  .requiredOption("-c, --client-name <name>", "Client or company name")
  .option("-p, --project-name <name>", "Project/product name")
  .requiredOption(
    "-t, --project-type <type>",
    "Project type (landing-page, web-app, saas, ecommerce, mobile-app, api-backend, other)",
  )
  .requiredOption(
    "-f, --features <items>",
    "Comma-separated feature keys",
    (v: string) => v.split(",").map((s) => s.trim()),
  )
  .option("--complexity <level>", "simple, medium, or complex (default medium)")
  .option(
    "--platforms <items>",
    "Comma-separated platforms (web, ios, android; default web)",
    (v: string) => v.split(",").map((s) => s.trim()),
  )
  .option(
    "--design-needs <level>",
    "none, basic, or custom-design-system (default basic)",
  )
  .option(
    "--region <region>",
    "pakistan, uae, us, uk, europe, other (default us)",
  )
  .option(
    "--weekly-capacity <hours>",
    "Your available hours/week (default 25)",
    Number,
  )
  .option(
    "--budget-hint <amount>",
    "Client's stated budget (for reference)",
    Number,
  )
  .option(
    "--deadline-hint <string>",
    "Client's stated deadline (for reference)",
  )
  .option("--additional-notes <text>", "Any extra context")
  .action((args) => {
    const input = buildArgs(args);
    const est = estimate(input);
    console.log(
      `\n${chalk.bold("📊 Estimate for")} ${chalk.cyan(input.clientName)}${input.projectName ? chalk.gray(` — ${input.projectName}`) : ""}`,
    );
    console.log(`${chalk.dim("─".repeat(48))}`);
    console.log(`  Total hours:      ${chalk.yellow(est.totalHours)}`);
    console.log(
      `  Timeline:         ${chalk.yellow(`${est.timelineWeeks.low}–${est.timelineWeeks.high} weeks`)}`,
    );
    console.log(
      `  Rate range:       ${chalk.green(fmtMoney(est.rate.low))}–${chalk.green(fmtMoney(est.rate.high))}/hr (${est.rate.region})`,
    );
    console.log(
      `  Price estimate:   ${chalk.bold.green(fmtMoney(est.price.low))} – ${chalk.bold.green(fmtMoney(est.price.high))}`,
    );
    if (est.unrecognizedFeatures.length) {
      console.log(
        `\n  ${chalk.yellow("⚠")} Unrecognized features (estimated conservatively): ${est.unrecognizedFeatures.join(", ")}`,
      );
    }
    console.log();
  });

program
  .command("generate")
  .description(
    "Generate a full proposal (tech stack, timeline, milestones, and Markdown document)",
  )
  .requiredOption("-c, --client-name <name>", "Client or company name")
  .option("-o, --output <path>", "Write the Markdown proposal to a file")
  .option("-p, --project-name <name>", "Project/product name")
  .requiredOption(
    "-t, --project-type <type>",
    "Project type (landing-page, web-app, saas, ecommerce, mobile-app, api-backend, other)",
  )
  .requiredOption(
    "-f, --features <items>",
    "Comma-separated feature keys",
    (v: string) => v.split(",").map((s) => s.trim()),
  )
  .option("--complexity <level>", "simple, medium, or complex (default medium)")
  .option(
    "--platforms <items>",
    "Comma-separated platforms (web, ios, android; default web)",
    (v: string) => v.split(",").map((s) => s.trim()),
  )
  .option(
    "--design-needs <level>",
    "none, basic, or custom-design-system (default basic)",
  )
  .option(
    "--region <region>",
    "pakistan, uae, us, uk, europe, other (default us)",
  )
  .option(
    "--weekly-capacity <hours>",
    "Your available hours/week (default 25)",
    Number,
  )
  .option(
    "--budget-hint <amount>",
    "Client's stated budget (for reference)",
    Number,
  )
  .option(
    "--deadline-hint <string>",
    "Client's stated deadline (for reference)",
  )
  .option("--additional-notes <text>", "Any extra context")
  .action((args) => {
    const input = buildArgs(args);
    const est = estimate(input);
    const techStack = recommendTechStack(input, est);
    const milestones = buildMilestones(est);
    const document = buildProposalDocument(input, est, techStack, milestones);

    if (args.output) {
      const filePath = resolve(args.output as string);
      writeFileSync(filePath, document, "utf-8");
      console.log(
        `\n${chalk.green("✓")} Proposal written to ${chalk.cyan(filePath)}\n`,
      );
    } else {
      console.log(
        `\n${chalk.bold("📄 Full Proposal")}\n${chalk.dim("─".repeat(48))}\n`,
      );
      console.log(document);
    }
  });

program
  .command("tech-stack")
  .description("Recommend a tech stack for the given requirements")
  .requiredOption("-c, --client-name <name>", "Client or company name")
  .option("-p, --project-name <name>", "Project/product name")
  .requiredOption("-t, --project-type <type>", "Project type")
  .requiredOption(
    "-f, --features <items>",
    "Comma-separated feature keys",
    (v: string) => v.split(",").map((s) => s.trim()),
  )
  .option("--complexity <level>", "simple, medium, or complex")
  .option("--platforms <items>", "Comma-separated platforms", (v: string) =>
    v.split(",").map((s) => s.trim()),
  )
  .option("--design-needs <level>", "none, basic, or custom-design-system")
  .option("--region <region>", "pakistan, uae, us, uk, europe, other")
  .option("--weekly-capacity <hours>", "Your available hours/week", Number)
  .option("--budget-hint <amount>", "Client's stated budget", Number)
  .option("--deadline-hint <string>", "Client's stated deadline")
  .option("--additional-notes <text>", "Any extra context")
  .action((args) => {
    const input = buildArgs(args);
    const est = estimate(input);
    const techStack = recommendTechStack(input, est);
    console.log(
      `\n${chalk.bold("🔧 Recommended Tech Stack")}\n${chalk.dim("─".repeat(32))}`,
    );
    for (const item of techStack) {
      console.log(`  • ${item}`);
    }
    console.log();
  });

program
  .command("features")
  .description("List the feature catalog with estimated hours and categories")
  .action(() => {
    console.log(
      `\n${chalk.bold("📋 Feature Catalog")}\n${chalk.dim("─".repeat(48))}`,
    );
    const catOrder = [
      "core",
      "commerce",
      "content",
      "engagement",
      "platform",
      "design",
    ];
    for (const cat of catOrder) {
      const items = Object.entries(FEATURE_CATALOG_MAP).filter(
        ([, v]) => v.category === cat,
      );
      if (!items.length) continue;
      console.log(`\n${chalk.underline(cat.toUpperCase())}`);
      for (const [key, def] of items) {
        console.log(`  ${chalk.cyan(key)} — ${def.label} (${def.hours}h)`);
      }
    }
    console.log();
  });

program.parse();
