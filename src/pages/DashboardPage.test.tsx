import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DashboardPage from "./DashboardPage";
import useAuthStore from "../store/authStore";

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  useAuthStore.getState().logout();
});

describe("DashboardPage", () => {
  it("does not ask for protected requests while signed out", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: "w1",
            title: "Edge AI Inference Cluster",
            description: "GPU nodes",
            createdAt: "2026-09-01T12:00:00.000Z",
          },
        ]),
        { status: 200 },
      ),
    );
    renderDashboard();

    expect(screen.getByText("Log in to see your requests")).toBeInTheDocument();
    // The workspace date is shown in a readable form, not as a raw timestamp.
    expect(await screen.findByText("Created: Sep 1, 2026")).toBeInTheDocument();

    const urls = fetchSpy.mock.calls.map(([url]) => String(url));
    expect(urls.some((url) => url.endsWith("/api/workspaces"))).toBe(true);
    expect(urls.some((url) => url.includes("/api/provision-requests"))).toBe(false);
  });
});
