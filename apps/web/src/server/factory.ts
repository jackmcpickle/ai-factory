import { createServerFn } from "@tanstack/react-start";

import type { FactoryInput } from "#/server/factory-result";
import { buildFactoryResult } from "#/server/factory-result";

export type { FactoryInput } from "#/server/factory-result";

export const runFactory = createServerFn({ method: "POST" })
  .validator((input: FactoryInput) => input)
  .handler(({ data }) => buildFactoryResult(data));
