# Proposal Generator

Generate freelancing proposals — tech stack, timeline, price estimate, milestones, and a ready-to-send Markdown proposal document — from client requirements.

## Tools

| Tool | Returns |
|---|---|
| `proposal-generator_generate_proposal` | Full pipeline: JSON summary + Markdown proposal document |
| `proposal-generator_estimate_price_and_timeline` | Quick estimate: hours, price range, timeline |
| `proposal-generator_recommend_tech_stack` | Tech stack suggestion based on project type + features |
| `proposal-generator_list_feature_catalog` | Every recognized feature key with its hour estimate and category |

## Usage

Call the tool with a descriptive prompt containing client requirements. Example:

```
Generate a proposal for Green Valley Fertilizers — they need an ecommerce
site with auth, product catalog, payments, admin dashboard, and search.
They're in Pakistan and have a medium budget.
```

The tool will ask for any missing details and return a complete proposal.

### Recognized feature keys

`auth`, `social-login`, `role-based-access`, `admin-dashboard`, `payments`, `subscription-billing`, `ecommerce-catalog`, `multi-vendor`, `cms`, `blog-seo`, `multi-language`, `search`, `real-time-chat`, `notifications`, `reviews-ratings`, `wishlist`, `booking-scheduling`, `analytics-dashboard`, `file-upload`, `api-integration`, `custom-design-system`, `mobile-responsive`

## Configuration

This skill relies on the `@dev_ahmad_org/proposal-generator` MCP server being registered in `opencode.json`:

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