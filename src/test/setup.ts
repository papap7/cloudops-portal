import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Registers DOM matchers (toBeInTheDocument, toHaveTextContent, ...) on
// expect() and their TypeScript declarations.
import "@testing-library/jest-dom/vitest";

// Vitest does not auto-unmount rendered components because test globals
// are disabled; unmount explicitly so tests stay isolated.
afterEach(() => {
  cleanup();
});
