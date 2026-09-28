import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { RuleForm } from "@/modules/rules/components/RuleForm";
import { RuleList } from "@/modules/rules/components/RuleList";
import { RulesProvider } from "@/modules/rules/hooks/useRules";

function renderRules() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <RulesProvider>
        <RuleForm />
        <RuleList />
      </RulesProvider>
    </QueryClientProvider>
  );
  return userEvent.setup();
}

async function addRule(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Name"), "no-nut-meals");
  await user.type(
    screen.getByLabelText("Check"),
    "Meals flagged nut-free never list tree nuts."
  );
  await user.click(screen.getByRole("button", { name: "Add rule" }));
  return screen.findByRole("heading", { name: "no-nut-meals" });
}

describe("rules editor", () => {
  it("starts with an empty state", () => {
    renderRules();

    expect(screen.getByText(/No rules yet/u)).toBeInTheDocument();
  });

  it("shows validation messages instead of adding an empty rule", async () => {
    const user = renderRules();

    await user.click(screen.getByRole("button", { name: "Add rule" }));

    await expect(
      screen.findByText("Name is required")
    ).resolves.toBeInTheDocument();
    expect(screen.getByText(/No rules yet/u)).toBeInTheDocument();
  });

  it("adds a rule and resets the form", async () => {
    const user = renderRules();

    const heading = await addRule(user);

    expect(heading).toBeInTheDocument();
    expect(screen.queryByText(/No rules yet/u)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("");
  });

  it("records a pull-request result when a rule runs", async () => {
    const user = renderRules();
    const heading = await addRule(user);
    const card = heading.closest("li");
    if (!card) {
      throw new Error("rule card not rendered as a list item");
    }

    await user.click(within(card).getByRole("button", { name: "Run" }));

    await expect(
      screen.findByRole("heading", { name: "Pull request results" })
    ).resolves.toBeInTheDocument();
  });

  it("removes a rule", async () => {
    const user = renderRules();
    await addRule(user);

    await user.click(screen.getByRole("button", { name: "Remove" }));

    await expect(
      screen.findByText(/No rules yet/u)
    ).resolves.toBeInTheDocument();
  });
});
