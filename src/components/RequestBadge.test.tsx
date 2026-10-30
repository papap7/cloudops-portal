import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RequestBadge from "./RequestBadge";
import type { ApiRequest } from "../types/index";

// Fixture typed as ApiRequest so schema drift fails the type check.
const pending: ApiRequest = {
  id: "665f1c2ab4e8d3a1f0c9e101",
  engineerId: 1,
  workspaceId: 3,
  resourceType: "Node.js Server",
  status: "Pending Review",
  requestedAt: "2026-10-17T02:15:00.000Z",
};

describe("RequestBadge", () => {
  it("shows the resource type and the Pending Review status", () => {
    render(<RequestBadge request={pending} />);

    expect(screen.getByText("Node.js Server")).toBeInTheDocument();
    expect(screen.getByText("Pending Review")).toBeInTheDocument();
  });

  it("maps a numeric status code from the API to its label", () => {
    // The API may return the enum's numeric value instead of its label;
    // ApiRequest types status as string, hence the cast.
    const active: ApiRequest = { ...pending, status: 2 as unknown as string };

    render(<RequestBadge request={active} />);

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.queryByText("Pending Review")).not.toBeInTheDocument();
  });
});
