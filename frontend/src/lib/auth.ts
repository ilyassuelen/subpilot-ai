const ACCESS_TOKEN_KEY = "subpilot_access_token";

function isBrowser() {
  return typeof window !== "undefined";
}

export function setAccessToken(token: string) {
  if (!isBrowser()) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function removeAccessToken() {
  if (!isBrowser()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}
