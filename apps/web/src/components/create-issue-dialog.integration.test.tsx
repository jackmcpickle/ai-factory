import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { useNavigate } from "@tanstack/react-router";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CreateIssueDialog } from "#/components/create-issue-dialog";
import { FactoryProvider } from "#/components/factory";
import { UiProvider } from "#/components/ui-state";
import type { runFactory } from "#/server/factory";
import { buildFactoryResult } from "#/server/factory-result";
import type { FactoryInput } from "#/server/factory-result";

// Only the RPC transport is replaced: the dialog still gets real orchestrator
// output computed from fixtures/*.json and policy.json.
vi.mock(import("#/server/factory"), () => ({
  // The stub skips createServerFn's RPC metadata, so it needs a cast.
  runFactory: (({ data }: { data: FactoryInput }) =>
    buildFactoryResult(data)) as unknown as typeof runFactory,
}));

// The dialog is rendered without a router, so only navigation is stubbed.
const navigate = vi.fn<(options: unknown) => Promise<void>>();
vi.mock(import("@tanstack/react-router"), async (importOriginal) => ({
  ...(await importOriginal()),
  // The stub ignores the router's generic route types, so it needs a cast.
  useNavigate: (() => navigate) as unknown as typeof useNavigate,
}));

async function renderDialog() {
  const user = userEvent.setup();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <UiProvider>
        <FactoryProvider>
          <CreateIssueDialog />
        </FactoryProvider>
      </UiProvider>
    </QueryClientProvider>
  );
  await waitFor(() => {
    expect(screen.queryByText("Loading workspace…")).not.toBeInTheDocument();
  });
  return user;
}

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.keyboard("c");
  return screen.findByRole("dialog", { name: "New issue" });
}

async function changeEveryField(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Issue title"), "Wrong meal count");
  await user.type(screen.getByLabelText("Description"), "Seen on the draft");
  await user.selectOptions(screen.getByLabelText("Priority"), "Urgent");
  await user.selectOptions(screen.getByLabelText("Status"), "In Progress");
  await user.selectOptions(screen.getByLabelText("Team"), "Platform");
}

function expectDefaults() {
  expect(screen.getByLabelText("Issue title")).toHaveValue("");
  expect(screen.getByLabelText("Description")).toHaveValue("");
  expect(screen.getByLabelText("Team")).toHaveDisplayValue("App");
  expect(screen.getByLabelText("Status")).toHaveDisplayValue("Todo");
  expect(screen.getByLabelText("Priority")).toHaveDisplayValue("Medium");
}

describe("new issue dialog", () => {
  it("opens with the defaults after a cancelled draft", async () => {
    const user = await renderDialog();
    await openDialog(user);
    await changeEveryField(user);

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    await openDialog(user);

    expectDefaults();
  });

  it("opens with the defaults after creating an issue", async () => {
    const user = await renderDialog();
    await openDialog(user);
    await changeEveryField(user);

    await user.click(screen.getByRole("button", { name: "Create issue" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(navigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: "/issues/$issueId" })
    );
    await openDialog(user);

    expectDefaults();
  });
});
