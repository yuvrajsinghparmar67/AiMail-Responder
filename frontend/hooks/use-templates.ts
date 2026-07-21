"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Template } from "@/lib/types";

interface TemplateInput {
  name: string;
  category: string;
  prompt_text: string;
}

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<Template[]>("/api/templates");
      setTemplates(data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load templates.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createTemplate = useCallback(
    async (input: TemplateInput) => {
      const created = await api.post<Template>("/api/templates", input);
      setTemplates((prev) => [created, ...prev]);
      return created;
    },
    []
  );

  const updateTemplate = useCallback(async (id: number, input: Partial<TemplateInput>) => {
    const updated = await api.put<Template>(`/api/templates/${id}`, input);
    setTemplates((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  const deleteTemplate = useCallback(async (id: number) => {
    await api.delete(`/api/templates/${id}`);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { templates, isLoading, error, createTemplate, updateTemplate, deleteTemplate, reload: load };
}
