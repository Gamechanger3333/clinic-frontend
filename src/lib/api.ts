/**
 * src/lib/api.ts — CSRF-aware fetch helper
 *
 * IMPORTANT CONTEXT (found while wiring up role dashboards + AI assistant):
 * The backend's csrfProtection middleware requires an `X-CSRF-Token` header
 * on every non-GET request, matching the `cf_csrf` cookie (double-submit
 * pattern). That cookie is set as `httpOnly: false` specifically so the
 * frontend can read it — but almost none of the existing pages were actually
 * reading it and attaching the header. That means POST/PATCH/DELETE calls
 * (creating an appointment, a patient, a prescription, an invoice, etc.)
 * were silently getting rejected with 403 "Invalid CSRF token" for every
 * role, not just patients.
 *
 * Use `apiFetch` instead of raw `fetch` for any mutating call (POST, PATCH,
 * PUT, DELETE) and this is handled automatically. GET requests work fine
 * with plain `fetch` as before.
 */

function readCsrfCookie(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|; )cf_csrf=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method || "GET").toUpperCase();
  const headers = new Headers(init.headers || {});

  if (method !== "GET" && method !== "HEAD") {
    const token = readCsrfCookie();
    if (token) headers.set("X-CSRF-Token", token);
  }

  return fetch(input, { ...init, headers });
}
