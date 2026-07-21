"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AnalyticsSummary, Draft, EmailGeneration } from "@/lib/types";

interface DashboardData {
  summary: AnalyticsSummary | null;
  recentEmails: EmailGeneration[];
  recentDrafts: Draft[];
  isLoading: boolean;
  error: string | null;
}

export function useDashboardData(): DashboardData {
  const [state, setState] = useState<DashboardData>({
    summary: null,
    recentEmails: [],
    recentDrafts: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [summary, recentEmails, recentDrafts] = await Promise.all([
          api.get<AnalyticsSummary>("/api/analytics/summary"),
          api.get<EmailGeneration[]>("/api/emails/history?limit=5"),
          api.get<Draft[]>("/api/drafts?limit=5"),
        ]);
        if (!cancelled) {
          setState({ summary, recentEmails, recentDrafts, isLoading: false, error: null });
        }
      } catch {
        if (!cancelled) {
          setState((s) => ({ ...s, isLoading: false, error: "Couldn't load dashboard data." }));
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
