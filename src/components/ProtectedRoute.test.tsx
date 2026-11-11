import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import ProtectedRoute from "./ProtectedRoute";
import useAuthStore from "../store/authStore";

function tokenExpiringIn(secondsFromNow: number): string {
  const encode = (o: object) =>
    btoa(JSON.stringify(o)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  const exp = Math.floor(Date.now() / 1000) + secondsFromNow;
  return `${encode({ alg: "HS256" })}.${encode({ userId: "u1", exp })}.signature`;
}

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/requests" element={<p>Requests page</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useAuthStore.getState().logout();
});

describe("ProtectedRoute", () => {
  it("sends a signed-out visitor to the login page", () => {
    renderAt("/requests");

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("shows the page to someone with a valid token", () => {
    useAuthStore.getState().setSession(tokenExpiringIn(3600), "Ana");

    renderAt("/requests");

    expect(screen.getByText("Requests page")).toBeInTheDocument();
  });

  it("signs out and redirects when the token has expired", () => {
    useAuthStore.getState().setSession(tokenExpiringIn(-60), "Ana");

    renderAt("/requests");

    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Requests page")).not.toBeInTheDocument();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().userName).toBeNull();
  });
});
