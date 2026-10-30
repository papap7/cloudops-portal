import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useToggle from "./useToggle";

describe("useToggle", () => {
  it("starts at the value it was given", () => {
    const { result } = renderHook(() => useToggle(false));

    expect(result.current[0]).toBe(false);
  });

  it("flips the value each time toggle is called", () => {
    // Start at true so a toggle that always sets true would be caught.
    const { result } = renderHook(() => useToggle(true));

    // State updates are wrapped in act() so React flushes the re-render
    // before result.current is read.
    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe(true);
  });
});
