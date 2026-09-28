import type { ReactElement } from "react";

import { formatRunTimestamp } from "@/lib/time";
import { useValidatorQuery } from "@/modules/validator/hooks/useValidatorQuery";
import type { ValidationReview } from "@/modules/validator/types";

export function ValidationResultList(): ReactElement {
  const { reviews, error } = useValidatorQuery();
  return (
    <div className="flex flex-col gap-3" data-testid="validation-results">
      <ValidationError message={error} />
      <EmptyReviews count={reviews.length} />
      <ul className="flex flex-col gap-3">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </ul>
    </div>
  );
}

function ValidationError({
  message,
}: {
  message: string | null;
}): ReactElement | null {
  if (!message) {
    return null;
  }
  return (
    <p className="text-destructive text-sm" role="alert">
      {message}
    </p>
  );
}

function EmptyReviews({ count }: { count: number }): ReactElement | null {
  if (count > 0) {
    return null;
  }
  return (
    <p className="text-muted-foreground text-sm">
      No reviews yet. Run a validation to see a mock result on this page.
    </p>
  );
}

function ReviewCard({ review }: { review: ValidationReview }): ReactElement {
  return (
    <li className="flex flex-col gap-2 rounded-md border p-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium">{review.headline}</h3>
        <span className="text-muted-foreground text-xs">
          {formatRunTimestamp(review.at)}
        </span>
      </div>
      <p className="text-sm">{review.body}</p>
      <p className="text-muted-foreground text-xs">
        Target: {review.targetLabel}
      </p>
      <p className="text-muted-foreground text-xs">
        Keywords: {review.keywords.join(", ")}
      </p>
      <p className="text-muted-foreground text-xs">{review.instructions}</p>
    </li>
  );
}
