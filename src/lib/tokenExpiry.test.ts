import { describe, it, expect } from "vitest";
import { isTokenExpired } from "./tokenExpiry";

// Builds a JWT-shaped string. The signature is never checked in the
// browser, so any text works there.
function tokenWith(payload: object): string {
  const encode = (o: object) =>
    btoa(JSON.stringify(o)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.signature`;
}

const NOW = Date.UTC(2026, 10, 12, 3, 0, 0);
const seconds = (ms: number) => Math.floor(ms / 1000);

describe("isTokenExpired", () => {
  it("is false for a token that expires in the future", () => {
    const token = tokenWith({ userId: "u1", exp: seconds(NOW) + 60 });

    expect(isTokenExpired(token, NOW)).toBe(false);
  });

  it("is true for a token whose exp has passed", () => {
    const token = tokenWith({ userId: "u1", exp: seconds(NOW) - 60 });

    expect(isTokenExpired(token, NOW)).toBe(true);
  });

  it("is true at the exact second of expiry", () => {
    const token = tokenWith({ userId: "u1", exp: seconds(NOW) });

    expect(isTokenExpired(token, NOW)).toBe(true);
  });

  it("leaves a token with no exp claim to the server", () => {
    expect(isTokenExpired(tokenWith({ userId: "u1" }), NOW)).toBe(false);
  });

  it("treats text that is not a JWT as expired", () => {
    expect(isTokenExpired("not-a-token", NOW)).toBe(true);
    expect(isTokenExpired("a.%%%.c", NOW)).toBe(true);
  });

  it("reads base64url payloads that contain - and _", () => {
    // "?" and ">" encode to "_" and "-" in base64url.
    const token = tokenWith({ userId: "???>>>", exp: seconds(NOW) + 60 });

    expect(token.split(".")[1]).toMatch(/[-_]/);
    expect(isTokenExpired(token, NOW)).toBe(false);
  });
});
