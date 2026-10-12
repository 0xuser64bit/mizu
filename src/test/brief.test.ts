import { describe, it, expect } from "vitest";
import { formatBrief, parseBrief } from "@/app/work/brief";

const good = {
  kind: "signature",
  about: "A timeline editor for our audio product.",
  link: "",
  budget: "8-15",
  timeline: "quarter",
  name: "Ada",
  email: "ada@example.com",
};

describe("commission brief", () => {
  it("accepts a whole brief and trims it", () => {
    expect(parseBrief({ ...good, name: "  Ada  " })).toEqual(good);
  });

  it("refuses what the page can't offer, with the reason", () => {
    expect(parseBrief(null)).toBe("Empty brief.");
    expect(parseBrief({ ...good, kind: "logo" })).toBe("Pick what you want made.");
    expect(parseBrief({ ...good, budget: 5 })).toBe("Pick a budget range.");
    expect(parseBrief({ ...good, email: "ada@" })).toBe(
      "That email address doesn't look right.",
    );
    expect(parseBrief({ ...good, about: "x".repeat(4001) })).toBe("The about is too long.");
  });

  it("keeps line breaks out of the subject", () => {
    const brief = parseBrief({ ...good, name: "Ada\r\nBcc: x@y.z" });
    if (typeof brief === "string") throw new Error(brief);
    const { subject, text } = formatBrief(brief);
    expect(subject).toBe("Brief — Signature interface — Ada Bcc: x@y.z");
    expect(text).toContain("Budget      $8k – $15k");
  });
});
