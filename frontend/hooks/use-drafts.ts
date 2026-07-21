"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Draft } from "@/lib/types";

export function useDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (favoritesOnly) params.set("favorites_only", "true");
      params.set("limit", "50");
      const data = await api.get<Draft[]>(`/api/drafts?${params.toString()}`);
      setDrafts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load drafts.");
    } finally {
      setIsLoading(false);
    }
  }, [search, favoritesOnly]);

  useEffect(() => {
    const timeout = setTimeout(load, 250); // debounce search typing
    return () => clearTimeout(timeout);
  }, [load]);

  const toggleFavorite = useCallback(async (id: number) => {
    const updated = await api.patch<Draft>(`/api/drafts/${id}/favorite`);
    setDrafts((prev) => prev.map((d) => (d.id === id ? updated : d)));
  }, []);

  const updateDraft = useCallback(async (id: number, input: { title?: string; content?: string }) => {
    const updated = await api.put<Draft>(`/api/drafts/${id}`, input);
    setDrafts((prev) => prev.map((d) => (d.id === id ? updated : d)));
    return updated;
  }, []);

  const deleteDraft = useCallback(async (id: number) => {
    await api.delete(`/api/drafts/${id}`);
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return {
    drafts,
    search,
    setSearch,
    favoritesOnly,
    setFavoritesOnly,
    isLoading,
    error,
    toggleFavorite,
    updateDraft,
    deleteDraft,
    reload: load,
  };
}
