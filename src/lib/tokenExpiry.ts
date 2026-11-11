// The API's login token is a JWT that expires 2 hours after it is issued.
// The browser cannot check the signature (only the server knows the
// secret), but it can read the "exp" claim, which is plain base64url JSON.
// That is enough to stop treating someone as signed in after their token
// has run out, instead of waiting for the API to refuse it.
//
// This is a convenience for the UI, not a security check: the server
// still verifies every token, whatever the browser decides here.
export function isTokenExpired(token: string, now: number = Date.now()): boolean {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const { exp } = JSON.parse(json) as { exp?: unknown };

    // No exp claim: the token never expires, so leave it to the server.
    if (typeof exp !== "number") return false;

    // exp is in seconds since 1970; Date.now() is in milliseconds.
    return exp * 1000 <= now;
  } catch {
    // Not a readable JWT, so it can never be accepted. Treat it as expired.
    return true;
  }
}
