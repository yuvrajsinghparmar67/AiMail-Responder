"use client";

import { useCallback, useRef, useState } from "react";
import { api, streamSSE, ApiError } from "@/lib/api";
import type { EmailGeneration, Language, ReplyLength, Tone } from "@/lib/types";

interface VariationItem {
  generated_reply: string;
  token_usage: number;
}

export function useEmailGenerator() {
  const [incomingText, setIncomingText] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [length, setLength] = useState<ReplyLength>("medium");
  const [language, setLanguage] = useState<Language>("english");
  const [customInstructions, setCustomInstructions] = useState("");

  const [streamedReply, setStreamedReply] = useState("");
  const [currentGeneration, setCurrentGeneration] = useState<EmailGeneration | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [variations, setVariations] = useState<VariationItem[]>([]);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);

  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const runStream = useCallback(async (path: string, body: unknown) => {
    setError(null);
    setIsGenerating(true);
    setStreamedReply("");
    setCurrentGeneration(null);
    setVariations([]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamSSE(
        path,
        body,
        (event) => {
          if (event.type === "token") {
            setStreamedReply((prev) => prev + (event.token as string));
          } else if (event.type === "done") {
            setCurrentGeneration(event.generation as EmailGeneration);
          } else if (event.type === "error") {
            setError((event.message as string) ?? "Something went wrong.");
          }
        },
        controller.signal
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generate = useCallback(() => {
    if (!incomingText.trim()) {
      setError("Paste an incoming email first.");
      return;
    }
    return runStream("/api/emails/generate", {
      incoming_text: incomingText,
      tone,
      length,
      language,
      custom_instructions: customInstructions || null,
    });
  }, [incomingText, tone, length, language, customInstructions, runStream]);

  const regenerate = useCallback(() => {
    if (!currentGeneration) return;
    return runStream("/api/emails/regenerate", {
      generation_id: currentGeneration.id,
      tone,
      length,
      language,
      custom_instructions: customInstructions || null,
    });
  }, [currentGeneration, tone, length, language, customInstructions, runStream]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const fetchVariations = useCallback(
    async (count: 2 | 3 | 4 = 2) => {
      if (!incomingText.trim()) {
        setError("Paste an incoming email first.");
        return;
      }
      setError(null);
      setIsGeneratingVariations(true);
      try {
        const res = await api.post<{ variations: VariationItem[] }>("/api/emails/variations", {
          incoming_text: incomingText,
          tone,
          length,
          language,
          count,
        });
        setVariations(res.variations);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Couldn't generate variations.");
      } finally {
        setIsGeneratingVariations(false);
      }
    },
    [incomingText, tone, length, language]
  );

  const saveDraft = useCallback(
    async (content: string, title?: string) => {
      setIsSavingDraft(true);
      try {
        await api.post("/api/drafts", {
          title: title || incomingText.slice(0, 60) || "Untitled draft",
          content,
          source_generation_id: currentGeneration?.id ?? null,
        });
        return true;
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Couldn't save draft.");
        return false;
      } finally {
        setIsSavingDraft(false);
      }
    },
    [incomingText, currentGeneration]
  );

  const reset = useCallback(() => {
    setIncomingText("");
    setCustomInstructions("");
    setStreamedReply("");
    setCurrentGeneration(null);
    setVariations([]);
    setError(null);
  }, []);

  return {
    // form state
    incomingText,
    setIncomingText,
    tone,
    setTone,
    length,
    setLength,
    language,
    setLanguage,
    customInstructions,
    setCustomInstructions,
    // generation state
    streamedReply,
    currentGeneration,
    isGenerating,
    error,
    // actions
    generate,
    regenerate,
    stop,
    reset,
    // variations
    variations,
    isGeneratingVariations,
    fetchVariations,
    // drafts
    isSavingDraft,
    saveDraft,
  };
}
