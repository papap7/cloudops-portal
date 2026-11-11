import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./LoginPage";

// Mirrors the providers in main.tsx (query client and router). MemoryRouter
// replaces BrowserRouter, which needs a browser location. Devtools omitted.
function renderLoginPage() {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("LoginPage", () => {
  it("shows both schema messages when the form is sent empty", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole("button", { name: "Log In" }));

    // Messages are defined in src/schemas/authSchema.ts. Validation is
    // asynchronous, so the first lookup uses findByText.
    expect(
      await screen.findByText("Please enter a valid email address."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 8 characters."),
    ).toBeInTheDocument();
  });

  it("sends nothing to the API while the form is invalid", async () => {
    // Spy without stubbing: any request made by client.ts would be recorded.
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText("Email"), "juan@dlsl.edu.ph");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: "Log In" }));

    expect(
      await screen.findByText("Password must be at least 8 characters."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Please enter a valid email address."),
    ).not.toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("hides the demo button when no demo account is configured", () => {
    renderLoginPage();

    expect(
      screen.queryByRole("button", { name: "Use demo account" }),
    ).not.toBeInTheDocument();
  });

  it("signs in with the configured demo account", async () => {
    vi.stubEnv("VITE_DEMO_EMAIL", "demo@cloudops.dev");
    vi.stubEnv("VITE_DEMO_PASSWORD", "demo-password-123");
    // Stub fetch so the test never leaves the machine.
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ message: "nope" }), { status: 401 }));
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole("button", { name: "Use demo account" }));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/auth\/login$/);
    expect(JSON.parse(String(init?.body))).toEqual({
      email: "demo@cloudops.dev",
      password: "demo-password-123",
    });
  });
});
