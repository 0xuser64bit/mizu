import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Commission } from "@/components/work/Commission";

const events = vi.hoisted(() => [] as unknown[][]);
vi.mock("@next/third-parties/google", () => ({
  sendGAEvent: (...args: unknown[]) => events.push(args),
}));
vi.mock("@/app/work/actions", () => ({
  sendBrief: vi.fn().mockResolvedValue(undefined),
}));

describe("commission brief funnel", () => {
  it("counts each question the visitor answers once, and never what they typed", async () => {
    const user = userEvent.setup();
    render(<Commission />);

    await user.click(
      screen.getByRole("button", { name: "Brief a signature interface" }),
    );
    screen.getByRole("radio", { name: /Signature interface/ }).focus();
    await user.keyboard("{Enter}");
    await user.type(
      await screen.findByRole("textbox", { name: /Tell me about it/ }),
      "A timeline editor for our audio app.{Control>}{Enter}{/Control}",
    );
    await user.type(
      await screen.findByRole("textbox", { name: /Where can I see it/ }),
      "{Enter}",
    );
    await screen.findByRole("radiogroup", { name: /budget/ });
    await user.keyboard("c");
    await screen.findByRole("radiogroup", { name: /When do you need it/ });
    await user.keyboard("b");
    await user.type(
      await screen.findByRole("textbox", { name: /And you are/ }),
      "Ada{Enter}",
    );
    await user.type(
      await screen.findByRole("textbox", { name: /Where should I reply/ }),
      "ada@example.com{Enter}",
    );
    await user.click(
      await screen.findByRole("button", { name: /Send the brief/ }),
    );
    await screen.findByText("It’s in.");

    expect(events.map((e) => [e[1], e[2]])).toEqual([
      ["brief_prefill", { commission: "signature" }],
      ["brief_start", {}],
      ["brief_answer", { question: "about", step: 2 }],
      ["brief_answer", { question: "budget", step: 4 }],
      ["brief_answer", { question: "timeline", step: 5 }],
      ["brief_answer", { question: "name", step: 6 }],
      ["brief_answer", { question: "email", step: 7 }],
      [
        "brief_sent",
        { commission: "signature", budget: "15-30", timeline: "quarter" },
      ],
    ]);
    expect(JSON.stringify(events)).not.toMatch(/timeline editor|Ada|example/);
  });
});
