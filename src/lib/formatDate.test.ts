import { describe, expect, it } from "vitest";
import { formatDate } from "./formatDate";

describe("formatDate", () => {
  it("formats an ISO timestamp as a short readable date", () => {
    // Midday UTC so the calendar day is the same in every time zone.
    expect(formatDate("2026-08-01T12:00:00.000Z")).toBe("Aug 1, 2026");
  });

  it("returns the original text when the value is not a date", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });
});
