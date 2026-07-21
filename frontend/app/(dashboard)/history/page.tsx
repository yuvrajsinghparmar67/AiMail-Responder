"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Copy, History, Save, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { api, ApiError } from "@/lib/api";
import { useHistory } from "@/hooks/use-history";
import { TONE_LABELS } from "@/lib/constants";
import type { EmailGeneration } from "@/lib/types";
import { cn } from "@/lib/utils";

function HistoryItem({ item }: { item: EmailGeneration }) {
  const [expanded, setExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  async function saveDraft() {
    setIsSaving(true);
    try {
      await api.post("/api/drafts", {
        title: item.incoming_text.slice(0, 60) || "Untitled draft",
        content: item.generated_reply,
        source_generation_id: item.id,
      });
      toast.success("Saved to drafts");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't save draft.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <button
          className="flex w-full items-start justify-between gap-4 text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{item.incoming_text}</p>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="muted">{TONE_LABELS[item.tone] ?? item.tone}</Badge>
              <span>
                {new Date(item.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")}
          />
        </button>

        {expanded && (
          <div className="mt-4 flex flex-col gap-3 border-t border-border/60 pt-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.generated_reply}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => copy(item.generated_reply)}>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </Button>
              <Button size="sm" onClick={saveDraft} disabled={isSaving}>
                <Save className="h-3.5 w-3.5" />
                {isSaving ? "Saving…" : "Save draft"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function HistoryPage() {
  const { history, search, setSearch, isLoading } = useHistory();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">History</h1>
        <p className="mt-1 text-muted-foreground">Every reply you've generated, searchable.</p>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search history…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={History}
              title="No history yet"
              description="Generated replies will show up here."
              actionHref="/generator"
              actionLabel="Open generator"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((item) => (
            <HistoryItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
