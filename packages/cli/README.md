# Proposal Generator CLI

Turn client requirements into a timeline, tech stack, price estimate, milestone breakdown, and a ready-to-send Markdown proposal — all from your terminal.

```bash
proposal-gen estimate -c "Green Valley" -t ecommerce -f auth,payments,ecommerce-catalog --region pakistan
```

Built on the same engine as the [Proposal Generator MCP server](../server). Use whichever interface fits your workflow.

## Install

```bash
npm install -g @dev_ahmad_org/proposal-generator-cli
# or
bun install -g @dev_ahmad_org/proposal-generator-cli
```

### From source (monorepo)

```bash
git clone <repo-url> proposal-generator
cd proposal-generator
bun install
bun run build
```

Then link the CLI globally:

```bash
bun link packages/cli
# or run directly:
node packages/cli/dist/index.mjs <command>
```

## Commands

### `proposal-gen estimate`

Quick back-of-envelope numbers — total hours, price range, and timeline.

```bash
proposal-gen estimate \
  -c "Acme Corp" \
  -t web-app \
  -f auth,payments,admin-dashboard \
  --region us \
  --complexity medium
```

### `proposal-gen generate`

Full proposal document with tech stack, milestones, payment schedule, and Markdown output.

```bash
proposal-gen generate \
  -c "Acme Corp" \
  -t ecommerce \
  -f auth,payments,ecommerce-catalog,search \
  --region us \
  --additional-notes "Needs multi-vendor support in phase 2"

# Write to file
proposal-gen generate \
  -c "Acme Corp" \
  -t saas \
  -f auth,subscription-billing,admin-dashboard \
  --region us \
  -o proposal.md
```

### `proposal-gen tech-stack`

Print the recommended tech stack only.

```bash
proposal-gen tech-stack \
  -c "Acme Corp" \
  -t mobile-app \
  -f auth,social-login,notifications,realtime-chat
```

### `proposal-gen features`

List the full feature catalog with hour estimates and categories.

```bash
proposal-gen features
```

## Options reference

| Option               | Used by                        | Description                                                                                     |
| -------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------- |
| `-c, --client-name`  | estimate, generate, tech-stack | Client or company name (required)                                                               |
| `-t, --project-type` | estimate, generate, tech-stack | `landing-page`, `web-app`, `saas`, `ecommerce`, `mobile-app`, `api-backend`, `other` (required) |
| `-f, --features`     | estimate, generate, tech-stack | Comma-separated feature keys (required)                                                         |
| `-p, --project-name` | estimate, generate, tech-stack | Optional project/product name                                                                   |
| `--complexity`       | estimate, generate, tech-stack | `simple`, `medium` (default), `complex`                                                         |
| `--platforms`        | estimate, generate, tech-stack | `web` (default), `ios`, `android`                                                               |
| `--design-needs`     | estimate, generate, tech-stack | `none`, `basic` (default), `custom-design-system`                                               |
| `--region`           | estimate, generate, tech-stack | `pakistan`, `uae`, `us` (default), `uk`, `europe`, `other`                                      |
| `--weekly-capacity`  | estimate, generate, tech-stack | Your available hours/week (default 25)                                                          |
| `--budget-hint`      | estimate, generate, tech-stack | Client's stated budget (reference only)                                                         |
| `--deadline-hint`    | estimate, generate, tech-stack | Client's stated deadline (reference only)                                                       |
| `--additional-notes` | estimate, generate, tech-stack | Extra context included in the proposal                                                          |
| `-o, --output`       | generate                       | Write the Markdown proposal to a file path                                                      |

## Customizing estimates

All rates, base hours, feature estimates, and milestones live in the server package:

- **Feature catalog** — `packages/server/src/data/featureCatalog.ts`
- **Rate cards & multipliers** — `packages/server/src/data/rateCards.ts`
- **Milestone template** — `packages/server/src/logic/estimator.ts`
- **Proposal layout** — `packages/server/src/logic/proposalBuilder.ts`

Edit any file, then rebuild with `bun run build` from the monorepo root.

## Development

```bash
# Build both server + CLI
bun run build

# Build just the CLI
bun run build:cli

# Preview without global install
bun run preview
```

## License

MIT
