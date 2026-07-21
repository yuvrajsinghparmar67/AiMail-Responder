"""
Lightweight in-memory rate limiter, used as a FastAPI dependency rather
than a decorator.

Originally this used slowapi's @limiter.limit(...) decorator. That
decorator wraps the route function itself, and in practice this interfered
with FastAPI's request-body parameter detection: on some slowapi/FastAPI
version combinations, a route decorated with @limiter.limit(...) would
stop recognizing its Pydantic `payload` parameter as a request body and
fall back to looking for it as a query parameter instead, producing a
misleading 422 "Field required" error even when the client sent a
perfectly valid JSON body.

A dependency avoids that failure mode entirely, since FastAPI resolves
dependencies as ordinary parameters rather than wrapping the whole
function — there's no signature-mangling risk.

Per-process, in-memory only — fine for a single backend instance. If you
scale to multiple backend processes/instances, this would need to move to
a shared store (e.g. Redis) since each process would otherwise track
limits independently.

NOTE: this file deliberately does NOT use
`from __future__ import annotations` (unlike most other files in this
project). RateLimiter.__call__ takes a `request: Request` parameter, and
FastAPI needs to recognize that as its special auto-injected Request type
at import time. With postponed evaluation of annotations active, that
hint stays a string ("Request") until something resolves it — and FastAPI
checks for its special parameter types before that resolution happens,
so it falls through to treating Request as a plain queryable field
instead. That mismatch is what produces a
`PydanticUserError: ... ForwardRef('Request') ... is not fully defined`
crash when building the OpenAPI schema (i.e. /docs and /openapi.json
failing) even though the app itself starts and runs correctly.
"""

import time
from collections import defaultdict

from fastapi import HTTPException, Request, status


def _parse_rate(rate: str) -> tuple[int, int]:
    """Parse 'N/unit' (e.g. '10/minute') into (times, seconds)."""
    times_str, _, unit = rate.partition("/")
    seconds_map = {"second": 1, "minute": 60, "hour": 3600, "day": 86400}
    return int(times_str), seconds_map.get(unit.strip().lower(), 60)


class RateLimiter:
    """
    Usage: add `dependencies=[Depends(RateLimiter(settings.rate_limit_auth))]`
    to a route decorator. Each RateLimiter instance tracks its own hit
    history, so construct one per distinct rate limit you need (as module-
    level singletons, so the history persists across requests) rather than
    a new instance per request.
    """

    def __init__(self, rate: str):
        self.times, self.seconds = _parse_rate(rate)
        self._hits: dict[str, list[float]] = defaultdict(list)

    def __call__(self, request: Request) -> None:
        ip = request.client.host if request.client else "unknown"
        now = time.time()
        window_start = now - self.seconds
        hits = self._hits[ip]
        while hits and hits[0] < window_start:
            hits.pop(0)
        if len(hits) >= self.times:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
            )
        hits.append(now)
