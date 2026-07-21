"""
Wraps the Gemini API for email reply generation.

Two generation modes, by design:
  - `stream_reply()` — token-by-token streaming for the primary generate/
    regenerate flow (the "Streaming responses" feature).
  - `generate_reply_once()` — a single non-streamed call, used to fan out
    N "variations" concurrently via asyncio.gather. Streaming N replies
    into N side-by-side cards simultaneously adds a lot of UI/connection
    complexity for little user benefit over a short wait with a loading
    state, so variations trade streaming for simplicity + concurrency.
"""
from __future__ import annotations

import asyncio
from collections.abc import AsyncGenerator

from google import genai
from google.genai import types

from app.core.config import get_settings

settings = get_settings()

_client: genai.Client | None = None


def get_client() -> genai.Client:
    global _client
    if _client is None:
        if not settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is not set. Add it to your .env file.")
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


TONE_INSTRUCTIONS: dict[str, str] = {
    "professional": "professional and polished, respectful but not stiff",
    "friendly": "warm and friendly, approachable while staying appropriate for work",
    "formal": "formal and precise, following traditional business-letter conventions",
    "casual": "casual and relaxed, like a quick note to a colleague you know well",
    "apologetic": "sincerely apologetic, acknowledging the issue without being overly self-critical",
    "sales": "persuasive and sales-oriented, highlighting value and a clear next step",
    "customer_support": "empathetic and solution-focused, typical of great customer support",
    "executive": "concise and authoritative, the way a busy executive communicates",
}

LENGTH_INSTRUCTIONS: dict[str, str] = {
    "short": "very brief — roughly 2-4 sentences, 40-70 words total",
    "medium": "a normal email length — roughly 1-2 short paragraphs, 100-160 words total",
    "long": "thorough and detailed — roughly 3-4 paragraphs, 220-320 words total",
}

LANGUAGE_NAMES: dict[str, str] = {
    "english": "English",
    "hindi": "Hindi",
    "spanish": "Spanish",
    "french": "French",
    "german": "German",
}


def _build_prompt(
    incoming_email: str,
    tone: str,
    length: str,
    language: str,
    custom_instructions: str | None = None,
    variation_hint: str | None = None,
) -> str:
    tone_desc = TONE_INSTRUCTIONS.get(tone, tone)
    length_desc = LENGTH_INSTRUCTIONS.get(length, length)
    language_name = LANGUAGE_NAMES.get(language, "English")

    parts = [
        f"Write a reply to the email below, written entirely in {language_name}.",
        f"Tone: {tone_desc}.",
        f"Length: {length_desc}.",
        "Address the sender's points directly. Do not invent facts, names, dates, "
        "or commitments that aren't implied by the incoming email.",
        "You may use light markdown (bold, bullet points) only where it genuinely "
        "aids clarity — most replies should read as plain, natural email prose.",
        "Output ONLY the reply body — no subject line, no explanation, no meta-commentary.",
    ]
    if custom_instructions:
        parts.append(f"Additional instructions: {custom_instructions}")
    if variation_hint:
        parts.append(variation_hint)

    parts.append(f"\nIncoming email:\n\"\"\"\n{incoming_email}\n\"\"\"")
    return "\n".join(parts)


async def stream_reply(
    incoming_email: str,
    tone: str,
    length: str,
    language: str,
    custom_instructions: str | None = None,
    variation_hint: str | None = None,
) -> AsyncGenerator[str, None]:
    """Yield reply text tokens as they arrive."""
    client = get_client()
    prompt = _build_prompt(incoming_email, tone, length, language, custom_instructions, variation_hint)

    stream = await client.aio.models.generate_content_stream(
        model=settings.chat_model,
        contents=[types.Content(role="user", parts=[types.Part(text=prompt)])],
    )
    async for chunk in stream:
        if chunk.text:
            yield chunk.text


async def generate_reply_once(
    incoming_email: str,
    tone: str,
    length: str,
    language: str,
    custom_instructions: str | None = None,
    variation_hint: str | None = None,
) -> tuple[str, int]:
    """Generate one full (non-streamed) reply. Returns (reply_text, token_usage)."""
    client = get_client()
    prompt = _build_prompt(incoming_email, tone, length, language, custom_instructions, variation_hint)

    response = await client.aio.models.generate_content(
        model=settings.chat_model,
        contents=[types.Content(role="user", parts=[types.Part(text=prompt)])],
    )
    token_usage = 0
    if response.usage_metadata and response.usage_metadata.total_token_count:
        token_usage = response.usage_metadata.total_token_count
    return response.text or "", token_usage


async def generate_variations(
    incoming_email: str,
    tone: str,
    length: str,
    language: str,
    count: int,
) -> list[tuple[str, int]]:
    """Generate `count` alternate replies concurrently, each nudged to differ."""
    hints = [
        None,
        "Write this version with a noticeably different opening line than a typical reply.",
        "Write this version to be slightly more concise and direct than usual.",
        "Write this version with a slightly more detailed, thorough approach.",
    ]
    tasks = [
        generate_reply_once(incoming_email, tone, length, language, variation_hint=hints[i % len(hints)])
        for i in range(count)
    ]
    return await asyncio.gather(*tasks)
