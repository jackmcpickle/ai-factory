import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { FactoryProvider } from "#/components/factory";
import { PolicyPage } from "#/components/pages";
import { UiProvider } from "#/components/ui-state";
import type { runFactory } from "#/server/factory";
import { buildFactoryResult } from "#/server/factory-result";
import type { FactoryInput } from "#/server/factory-result";

// Only the RPC transport is replaced: the page still gets real orchestrator
// output computed from fixtures/*.json and policy.json on every query.
vi.mock(import("#/server/factory"), () => ({
  // The stub skips createServerFn's RPC metadata, so it needs a cast.
  runFactory: (({ data }: { data: FactoryInput }) =>
    buildFactoryResult(data)) as unknown as typeof runFactory,
}));

function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <UiProvider>
        <FactoryProvider>{ui}</FactoryProvider>
      </UiProvider>
    </QueryClientProvider>
  );
}

/** Reads the <dd> paired with a <dt> label in the policy summary list. */
function summaryValue(label: string) {
  return screen.getByText(label, { selector: "dt" }).nextElementSibling;
}

describe("policy page with the real orchestrator", () => {
  it("renders the dry-run summary the engine produces", async () => {
    const expected = await buildFactoryResult({});
    renderWithProviders(<PolicyPage />);

    await expect(
      screen.findByRole("heading", { name: "Policy" })
    ).resolves.toBeInTheDocument();
    expect(summaryValue("Version")).toHaveTextContent(expected.policy.version);
    expect(summaryValue("Run")).toHaveTextContent(expected.run.runId);
    expect(summaryValue("Review ready")).toHaveTextContent(
      String(expected.run.summary.reviewReady)
    );
    expect(summaryValue("Human only")).toHaveTextContent(
      String(expected.run.summary.humanOnly)
    );
  });

  it("never shows a release as approved", async () => {
    renderWithProviders(<PolicyPage />);
    await screen.findByRole("heading", { name: "Policy" });

    expect(summaryValue("Release approved")).toHaveTextContent("no");
  });

  it("re-runs the engine when UI work is made human-only", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PolicyPage />);
    await screen.findByRole("heading", { name: "Policy" });
    expect(summaryValue("SIG-001")).not.toHaveTextContent("human only");

    await user.click(screen.getByRole("button", { name: "Add ui" }));

    await waitFor(() => {
      expect(summaryValue("SIG-001")).toHaveTextContent("human only");
    });
    expect(summaryValue("Version")).toHaveTextContent("demo-v2");
    expect(screen.getByRole("button", { name: "ui ×" })).toBeInTheDocument();
  });

  it("dispatches the feedback loop when the webhook trigger fires", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PolicyPage />);
    await screen.findByRole("heading", { name: "Policy" });

    await user.click(screen.getByRole("button", { name: "Feedback webhook" }));

    await expect(
      screen.findByText(/Loops matched: feedback-intake/u)
    ).resolves.toBeInTheDocument();
  });
});
