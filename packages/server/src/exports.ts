export {
  estimate,
  buildMilestones,
  recommendTechStack,
  type ProposalInput,
  type EstimateResult,
  type Milestone,
  type RecognizedFeature,
} from "./logic/estimator.js";
export { buildProposalDocument } from "./logic/proposalBuilder.js";
export { FEATURE_CATALOG, type FeatureDefinition } from "./data/featureCatalog.js";
export {
  type Region,
  type ProjectType,
  type Complexity,
  type RateRange,
} from "./data/rateCards.js";
