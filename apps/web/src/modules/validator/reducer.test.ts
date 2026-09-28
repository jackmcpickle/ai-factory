import { describe, expect, it } from "vitest";

import { addKeyword, buildMockReview } from "@/modules/validator/helpers";
import {
  createValidatorModel,
  validatorReducer,
} from "@/modules/validator/reducer";
import type { ValidatorDraft } from "@/modules/validator/types";

const AT = "2026-09-28T13:00:00.000Z";

function draft(overrides: Partial<ValidatorDraft> = {}): ValidatorDraft {
  return {
    instructions: "Flag unused secrets in the diff.",
    target: "security",
    featureName: "",
    keywords: ["secret", "token"],
    ...overrides,
  };
}

describe("validator keywords", () => {
  it("trims, ignores blanks, and skips duplicates", () => {
    expect(addKeyword([], "  secret ")).toStrictEqual(["secret"]);
    expect(addKeyword(["secret"], "SECRET")).toStrictEqual(["secret"]);
    expect(addKeyword(["secret"], "   ")).toStrictEqual(["secret"]);
  });
});

describe("validator runs", () => {
  it("echoes the target and keywords in a mock review", () => {
    const review = buildMockReview({
      id: "review_1",
      at: AT,
      draft: draft({ target: "feature", featureName: "Billing" }),
    });
    expect(review.targetLabel).toBe("Billing");
    expect(review.body).toContain("Billing");
    expect(review.body).toContain("secret, token");
    expect(review.keywords).toStrictEqual(["secret", "token"]);
  });

  it("records a review and keeps a newer run first", () => {
    const first = validatorReducer(createValidatorModel(), {
      type: "RUN",
      at: AT,
      draft: draft(),
    });
    expect(first.type).toBe("Reviewed");
    const second = validatorReducer(first, {
      type: "RUN",
      at: AT,
      draft: draft({ target: "backend", keywords: ["migration"] }),
    });
    expect(second.reviews.map((item) => item.targetLabel)).toStrictEqual([
      "Backend",
      "Security",
    ]);
  });

  it("does not record a review without a feature name or a keyword", () => {
    const missingFeature = validatorReducer(createValidatorModel(), {
      type: "RUN",
      at: AT,
      draft: draft({ target: "feature", featureName: "  " }),
    });
    expect(missingFeature.type).toBe("Invalid");
    expect(missingFeature.reviews).toStrictEqual([]);
    const missingKeyword = validatorReducer(createValidatorModel(), {
      type: "RUN",
      at: AT,
      draft: draft({ keywords: [] }),
    });
    expect(missingKeyword.type).toBe("Invalid");
  });
});
