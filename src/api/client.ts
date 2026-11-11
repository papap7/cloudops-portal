import type { ApiWorkspace, ApiRequest, NewRequest, ApiEngineer, AuthReply, AiAdvisor } from "../types/index";
import useAuthStore from "../store/authStore";

export const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error(
    "VITE_API_URL is missing. Copy .env.example to .env, fill it in, and restart npm run dev."
  );
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  // 401 on a request that carried a token means the server no longer
  // accepts it (expired, or signed with an old secret). Sign out, so the
  // route guard sends the user to the login page instead of leaving them
  // "signed in" on a page that can only show errors. Login and register
  // are excluded: there, 401 means a wrong password, not a dead session.
  if (res.status === 401 && token && !path.startsWith("/api/auth/")) {
    useAuthStore.getState().logout();
    throw new Error("Your session has expired. Please log in again.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Request failed (${res.status})`);
  }

  return res.json();
}

// Public Workspace calls
export function fetchWorkspaces(): Promise<ApiWorkspace[]> {
  return request<ApiWorkspace[]>("/api/workspaces");
}

export function fetchWorkspaceById(id: string): Promise<ApiWorkspace> {
  return request<ApiWorkspace>(`/api/workspaces/${id}`);
}

// Protected Requests calls (token attached automatically)
export function fetchRequests(): Promise<ApiRequest[]> {
  return request<ApiRequest[]>("/api/provision-requests");
}

export function createRequest(newRequest: NewRequest): Promise<ApiRequest> {
  return request<ApiRequest>("/api/provision-requests", {
    method: "POST",
    body: JSON.stringify(newRequest),
  });
}

// Auth calls
export function registerUser(body: {
  name: string;
  email: string;
  password: string;
}): Promise<ApiEngineer> {
  return request<ApiEngineer>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function loginUser(body: {
  email: string;
  password: string;
}): Promise<AuthReply> {
  return request<AuthReply>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ===== SESSION 11: one more private call ===============================
// ---- ai: private, like provision requests. The token goes on automatically,
// which matters more here than anywhere: without it, anyone could
// spend your Gemini quota.
export function askAi(prompt: string): Promise<AiAdvisor> {
  return request<AiAdvisor>("/api/ai", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });
}
