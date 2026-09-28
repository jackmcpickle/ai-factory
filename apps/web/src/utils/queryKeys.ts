export const dashboardKeys = {
  all: ["dashboard"] as const,
  snapshot: () => [...dashboardKeys.all, "snapshot"] as const,
};

export const automationKeys = {
  all: ["automation"] as const,
  details: () => [...automationKeys.all, "detail"] as const,
  detail: (key: string) => [...automationKeys.details(), key] as const,
};

export const skillLibraryKeys = {
  all: ["skill-library"] as const,
  lists: () => [...skillLibraryKeys.all, "list"] as const,
};

export const validatorKeys = {
  all: ["validator"] as const,
  lists: () => [...validatorKeys.all, "list"] as const,
};

export const ruleKeys = {
  all: ["rules"] as const,
  lists: () => [...ruleKeys.all, "list"] as const,
};

export const integrationKeys = {
  all: ["integrations"] as const,
  lists: () => [...integrationKeys.all, "list"] as const,
};
