import { getAuthCookie } from "@/lib/cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * FastAPI error responses shape `detail` two different ways depending on
 * the failure: a plain string for HTTPException (e.g. "Incorrect email or
 * password."), or an array of Pydantic validation-error objects for a 422
 * (e.g. [{loc: ["body", "password"], msg: "Field required"}]). Rendering
 * the array directly as a string used to show "[object Object]" — this
 * normalizes both shapes into one readable message, prefixed with the
 * field name when available so it's actually actionable.
 */
function formatApiErrorDetail(detail: unknown): string | undefined {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const message = detail
      .map((e: { loc?: unknown[]; msg?: string }) => {
        const field = e.loc?.[e.loc.length - 1];
        return field && typeof field === "string" ? `${field}: ${e.msg}` : e.msg;
      })
      .filter(Boolean)
      .join(", ");
    return message || undefined;
  }
  return undefined;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean; // attach Authorization header (default: true)
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = options;

  const finalHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (auth) {
    const token = getAuthCookie();
    if (token) {
      (finalHeaders as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const errBody = await res.json();
      message = formatApiErrorDetail(errBody.detail) ?? message;
    } catch {
      // response wasn't JSON; keep the generic message
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};

interface SSEEvent {
  type: string;
  [key: string]: unknown;
}

/**
 * POST to an SSE endpoint and dispatch each `data: {...}` line to `onEvent`.
 * Native EventSource can't send a POST body or custom headers, so this
 * reads the fetch Response body as a stream and parses SSE framing by hand.
 */
export async function streamSSE(
  path: string,
  body: unknown,
  onEvent: (event: SSEEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const token = getAuthCookie();
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok || !res.body) {
    let message = `Request failed with status ${res.status}`;
    try {
      const errBody = await res.json();
      message = formatApiErrorDetail(errBody.detail) ?? message;
    } catch {
      // not JSON; keep generic message
    }
    throw new ApiError(message, res.status);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const messages = buffer.split("\n\n");
    buffer = messages.pop() ?? ""; // last chunk may be incomplete; keep it buffered

    for (const message of messages) {
      const line = message.split("\n").find((l) => l.startsWith("data:"));
      if (!line) continue;
      try {
        onEvent(JSON.parse(line.slice(5).trim()));
      } catch {
        // malformed SSE frame; skip it rather than crash the stream
      }
    }
  }
}

export { API_URL };
