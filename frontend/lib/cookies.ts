const TOKEN_COOKIE = "auth_token";

/** 7 days, matching the backend's default JWT expiry. */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function setAuthCookie(token: string): void {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = [
    `${TOKEN_COOKIE}=${token}`,
    "path=/",
    `max-age=${MAX_AGE_SECONDS}`,
    "SameSite=Lax",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function getAuthCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_COOKIE}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function clearAuthCookie(): void {
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`;
}

export const AUTH_COOKIE_NAME = TOKEN_COOKIE;
