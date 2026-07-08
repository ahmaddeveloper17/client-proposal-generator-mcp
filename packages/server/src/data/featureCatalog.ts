/**
 * Feature catalog: every feature a client might ask for, mapped to
 * an estimated dev-hour cost and the tech it typically pulls in.
 *
 * Hours are calibrated for a solo full-stack freelancer working with a
 * modern MERN / Next.js stack. Adjust these numbers to match your own
 * measured velocity — they're the single biggest lever on the estimate.
 */

export interface FeatureDefinition {
  label: string;
  hours: number;
  tech: string[];
  category: "core" | "commerce" | "content" | "engagement" | "platform" | "design";
}

export const FEATURE_CATALOG: Record<string, FeatureDefinition> = {
  auth: {
    label: "User authentication",
    hours: 16,
    tech: ["JWT / Auth.js", "bcrypt password hashing"],
    category: "core",
  },
  "social-login": {
    label: "Social login (Google/Facebook)",
    hours: 8,
    tech: ["OAuth 2.0 providers"],
    category: "core",
  },
  "role-based-access": {
    label: "Role-based access control",
    hours: 14,
    tech: ["RBAC middleware"],
    category: "core",
  },
  "admin-dashboard": {
    label: "Admin dashboard",
    hours: 40,
    tech: ["Protected admin routes", "Data tables & charts"],
    category: "platform",
  },
  payments: {
    label: "Payment processing",
    hours: 24,
    tech: ["Stripe / PayPal", "JazzCash / Easypaisa (if Pakistan-facing)"],
    category: "commerce",
  },
  "subscription-billing": {
    label: "Subscription billing",
    hours: 32,
    tech: ["Stripe Billing", "Webhook-driven entitlements"],
    category: "commerce",
  },
  "ecommerce-catalog": {
    label: "Product catalog, cart & checkout",
    hours: 36,
    tech: ["Product/variant schema", "Cart state", "Checkout flow"],
    category: "commerce",
  },
  "multi-vendor": {
    label: "Multi-vendor marketplace logic",
    hours: 48,
    tech: ["Vendor dashboards", "Commission & payout logic"],
    category: "commerce",
  },
  cms: {
    label: "Content management (CMS)",
    hours: 20,
    tech: ["Headless CMS (Sanity/Contentful) or custom CMS panel"],
    category: "content",
  },
  "blog-seo": {
    label: "Blog with SEO structure",
    hours: 16,
    tech: ["MDX/CMS-driven posts", "Schema markup", "Sitemap/OG tags"],
    category: "content",
  },
  "multi-language": {
    label: "Multi-language / i18n",
    hours: 16,
    tech: ["next-intl / react-i18next"],
    category: "content",
  },
  search: {
    label: "Search",
    hours: 16,
    tech: ["Algolia / MongoDB Atlas Search"],
    category: "engagement",
  },
  "real-time-chat": {
    label: "Real-time chat / messaging",
    hours: 32,
    tech: ["Socket.io / WebSockets"],
    category: "engagement",
  },
  notifications: {
    label: "Notifications (email/push)",
    hours: 12,
    tech: ["Resend/SendGrid", "Web push"],
    category: "engagement",
  },
  "reviews-ratings": {
    label: "Reviews & ratings",
    hours: 10,
    tech: ["Rating aggregation"],
    category: "engagement",
  },
  wishlist: {
    label: "Wishlist / saved items",
    hours: 6,
    tech: ["Saved-items model"],
    category: "engagement",
  },
  "booking-scheduling": {
    label: "Booking / scheduling system",
    hours: 28,
    tech: ["Calendar logic", "Slot availability"],
    category: "platform",
  },
  "analytics-dashboard": {
    label: "Analytics dashboard",
    hours: 28,
    tech: ["Recharts/Chart.js", "Aggregation queries"],
    category: "platform",
  },
  "file-upload": {
    label: "File / image upload",
    hours: 10,
    tech: ["ImageKit / Cloudinary / S3"],
    category: "platform",
  },
  "api-integration": {
    label: "3rd-party API integration (per integration)",
    hours: 12,
    tech: ["REST/webhook integration"],
    category: "platform",
  },
  "custom-design-system": {
    label: "Custom design system",
    hours: 24,
    tech: ["Design tokens", "Reusable component library"],
    category: "design",
  },
  "mobile-responsive": {
    label: "Mobile-responsive polish pass",
    hours: 8,
    tech: ["Responsive breakpoints", "Touch-friendly UI"],
    category: "design",
  },
};

export type FeatureKey = keyof typeof FEATURE_CATALOG;
