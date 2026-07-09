# Proposal Generator MCP

An MCP (Model Context Protocol) server that turns client requirements into a
timeline, tech stack, price estimate, milestone breakdown, and a ready-to-send
Markdown proposal document — built for freelancers and agencies.

```json
{
  "clientName": "Green Valley Fertilizers",
  "projectType": "ecommerce",
  "features": ["auth", "ecommerce-catalog", "payments", "admin-dashboard", "search"],
  "region": "pakistan"
}
```

Use it from Claude Desktop, Claude Code, Cursor, or any MCP-compatible client.

## Tools

| Tool                          | Returns                                                          |
| ----------------------------- | ---------------------------------------------------------------- |
| `generate_proposal`           | Full pipeline: JSON summary + Markdown proposal document         |
| `estimate_price_and_timeline` | Quick estimate: hours, price range, timeline                     |
| `recommend_tech_stack`        | Tech stack suggestion based on project type + features           |
| `list_feature_catalog`        | Every recognized feature key with its hour estimate and category |

## Install & run

### Option A — from source (local development)

```bash
git clone <repo-url> proposal-generator
cd proposal-generator
bun install
bun run build
```

Start the server:

```bash
bun start
```

### Option B — from npm (published package)

```bash
npm install -g @proposal-generator/server
# or
bun install -g @proposal-generator/server
```

Run it:

```bash
proposal-generator-mcp
```

### Scripts reference

| Script               | Description                                 |
| -------------------- | ------------------------------------------- |
| `bun run build`      | Build with tsdown (ESM + .d.ts + sourcemap) |
| `bun run dev`        | Watch mode rebuild on changes               |
| `bun run lint`       | Auto-fix lint & formatting issues (biome)   |
| `bun run lint:check` | Check lint without writing                  |
| `bun run typecheck`  | `tsc --noEmit` type verification            |
| `bun run release`    | Build, bump version, publish to npm         |

---

## Configure your MCP client

### Claude Desktop

Edit `claude_desktop_config.json` (location varies by OS):

**Local source install:**

```json
{
  "mcpServers": {
    "proposal-generator": {
      "command": "bun",
      "args": ["run", "/absolute/path/to/proposal-generator/packages/server/dist/index.mjs"]
    }
  }
}
```

**Global npm install:**

```json
{
  "mcpServers": {
    "proposal-generator": {
      "command": "npx",
      "args": ["@proposal-generator/server"]
    }
  }
}
```

### Claude Code

```bash
# Local source install
claude mcp add proposal-generator -- bun run /absolute/path/to/proposal-generator/packages/server/dist/index.mjs

# Global npm install
claude mcp add proposal-generator -- npx @proposal-generator/server
```

### Cursor

Settings → Features → MCP Servers → Add new MCP server:

| Field   | Local                                       | npm                              |
| ------- | ------------------------------------------- | -------------------------------- |
| Name    | `proposal-generator`                        | `proposal-generator`             |
| Type    | `command`                                   | `command`                        |
| Command | `bun run /absolute/path/.../dist/index.mjs` | `npx @proposal-generator/server` |

### opencode

If using opencode, add to your project's `opencode.json`:

```json
{
  "mcpServers": {
    "proposal-generator": {
      "command": "bun",
      "args": ["run", "packages/server/dist/index.mjs"]
    }
  }
}
```

### Any MCP client (stdio)

```json
{
  "mcpServers": {
    "proposal-generator": {
      "command": "bun",
      "args": ["run", "/path/to/packages/server/dist/index.mjs"]
    }
  }
}
```

---

## Customizing estimates

Everything that drives the numbers lives in two files — no logic changes needed:

| File                                         | What to tune                                                               |
| -------------------------------------------- | -------------------------------------------------------------------------- |
| `packages/server/src/data/featureCatalog.ts` | Feature keys, hour estimates, tech pulled in                               |
| `packages/server/src/data/rateCards.ts`      | Regional hourly rates, base hours per project type, complexity multipliers |

The milestone template (phase names, payment splits) lives in `packages/server/src/logic/estimator.ts`.
The proposal document layout lives in `packages/server/src/logic/proposalBuilder.ts`.

After editing any of these, rebuild with `bun run build`.

---

## Project structure

```
proposal-generator/
├── package.json               # workspace root (bun monorepo)
├── biome.json                 # lint & format config
├── tsconfig.base.json         # shared TypeScript config
├── opencode.json              # opencode MCP config
├── .gitignore
├── README.md
│
└── packages/
    └── server/                # @proposal-generator/server
        ├── package.json
        ├── tsconfig.json      # extends tsconfig.base.json
        ├── tsdown.config.ts   # build config
        ├── dist/              # build output (gitignored)
        └── src/
            ├── index.ts                   # MCP server + tool definitions
            ├── data/
            │   ├── featureCatalog.ts      # feature -> hours/tech mapping
            │   └── rateCards.ts           # regional rates, base hours, multipliers
            └── logic/
                ├── estimator.ts           # core math: hours, price, timeline, milestones
                └── proposalBuilder.ts     # renders the Markdown proposal document
```

---

## Publishing to npm

```bash
# Login (one-time)
npm login

# Bump version, tag, and publish
bun run release
```

This runs: `bun run build` → `bumpp` (version bump + git tag) → `npm publish`.
