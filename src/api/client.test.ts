import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchRequests, fetchWorkspaces, loginUser } from "./client";
import useAuthStore from "../store/authStore";

function respond(status: number, body: unknown) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

beforeEach(() => {
  useAuthStore.getState().setSession("header.payload.signature", "Ana");
});

afterEach(() => {
  vi.restoreAllMocks();
  useAuthStore.getState().logout();
});

describe("API client", () => {
  it("attaches the token to every request", async () => {
    const fetchMock = respond(200, []);

    await fetchRequests();

    const [, init] = fetchMock.mock.calls[0];
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer header.payload.signature",
    );
  });

  it("signs out when the API refuses the token", async () => {
    respond(401, { message: "Token is invalid or has expired" });

    await expect(fetchRequests()).rejects.toThrow(
      "Your session has expired. Please log in again.",
    );
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().userName).toBeNull();
  });

  it("keeps the session on a 401 from login, which means a wrong password", async () => {
    respond(401, { message: "Email or password is incorrect" });

    await expect(
      loginUser({ email: "ana@example.test", password: "wrong-password" }),
    ).rejects.toThrow("Email or password is incorrect");
    expect(useAuthStore.getState().token).toBe("header.payload.signature");
  });

  it("keeps the session on other errors and shows the API's message", async () => {
    respond(500, { message: "Something went wrong" });

    await expect(fetchWorkspaces()).rejects.toThrow("Something went wrong");
    expect(useAuthStore.getState().token).toBe("header.payload.signature");
  });

  it("does not sign anyone out on a 401 when no token was sent", async () => {
    useAuthStore.getState().logout();
    const logout = vi.spyOn(useAuthStore.getState(), "logout");
    respond(401, { message: "No token. Send Authorization: Bearer <token>" });

    await expect(fetchRequests()).rejects.toThrow("No token.");
    expect(logout).not.toHaveBeenCalled();
  });
});
