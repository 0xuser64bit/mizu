import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AutomationBuilder } from "@/components/examples/AutomationBuilder";
import { DesignReview } from "@/components/examples/DesignReview";
import { IncidentReview } from "@/components/examples/IncidentReview";
import { mockLayout } from "./helpers";

let restore: () => void;
beforeEach(() => {
  restore = mockLayout(1200, 320);
});
afterEach(() => restore());

describe("composed examples", () => {
  it("incident review moves every view to the same moment", async () => {
    const user = userEvent.setup();
    render(<IncidentReview />);
    expect(screen.getByText("Time in focus: 09:31:20")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Next moment/ }));
    expect(screen.getByText("Time in focus: 09:33:10")).toBeInTheDocument();
    // The log opens the line nearest that moment.
    await waitFor(() =>
      expect(screen.getByText(/line \d+ of/)).toBeInTheDocument(),
    );
    expect(
      within(screen.getByRole("list", { name: "Happening then" })).getByText(
        "Decision: roll back",
      ),
    ).toBeInTheDocument();
  });

  it("design review puts each decision on the board", async () => {
    const user = userEvent.setup();
    render(<DesignReview />);
    const deck = screen.getByRole("group", {
      name: /by Aiko Tanaka, item 1 of 8/,
    });
    deck.focus();
    await user.keyboard("{ArrowRight}");
    const board = screen.getByRole("region", { name: "Decisions" });
    expect(
      within(board).getByText("Harbour at first light"),
    ).toBeInTheDocument();
    await user.keyboard("{Backspace}");
    expect(
      within(board).queryByText("Harbour at first light"),
    ).not.toBeInTheDocument();
  });

  it("automation builder routes records by the query and runs the flow", async () => {
    const user = userEvent.setup();
    render(<AutomationBuilder />);
    const count = screen.getByText(/of 20 bookings take the crane path/);
    const before = Number(count.textContent!.split(" ")[0]);
    expect(before).toBeGreaterThan(0);
    expect(screen.getAllByText("Crane berth")).toHaveLength(before);
    await user.click(screen.getByRole("button", { name: "Run the flow" }));
    await waitFor(
      () =>
        expect(
          screen.getByRole("button", { name: "Run the flow" }),
        ).not.toHaveAttribute("aria-busy"),
      { timeout: 4000 },
    );
  });
});
