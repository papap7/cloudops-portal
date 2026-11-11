import { describe, it, expect, afterEach } from "vitest";
import useAuthStore from "./authStore";

function tokenExpiringIn(secondsFromNow: number): string {
  const encode = (o: object) =>
    btoa(JSON.stringify(o)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  const exp = Math.floor(Date.now() / 1000) + secondsFromNow;
  return `${encode({ alg: "HS256" })}.${encode({ userId: "u1", exp })}.signature`;
}

// What the store reads back from localStorage when a page loads.
async function loadSaved(token: string) {
  localStorage.setItem(
    "itelect4-auth",
    JSON.stringify({ state: { token, userName: "Ana" }, version: 0 }),
  );
  await useAuthStore.persist.rehydrate();
}

afterEach(() => {
  useAuthStore.getState().logout();
  localStorage.clear();
});

describe("authStore", () => {
  it("restores a saved session whose token is still valid", async () => {
    const token = tokenExpiringIn(3600);

    await loadSaved(token);

    expect(useAuthStore.getState().token).toBe(token);
    expect(useAuthStore.getState().userName).toBe("Ana");
  });

  it("drops a saved session whose token has expired", async () => {
    await loadSaved(tokenExpiringIn(-60));

    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().userName).toBeNull();
  });
});
