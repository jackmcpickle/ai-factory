// Override with FACTORY_ANALYST_MODEL / FACTORY_ENGINEER_MODEL when a model id changes.
export const MODELS = {
  analyst: process.env.FACTORY_ANALYST_MODEL ?? "claude-sonnet-5-5",
  engineer: process.env.FACTORY_ENGINEER_MODEL ?? "claude-opus-5-5",
};
