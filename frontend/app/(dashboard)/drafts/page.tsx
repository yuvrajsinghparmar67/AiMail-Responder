"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, FileDown, FileText, Pencil, Save, Search, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { useDrafts } from "@/hooks/use-drafts";
import { exportTextAsPdf } from "@/lib/pdf";
import type { Draft } from "@/lib/types";

function DraftCard({
  draft,
  onToggleFavorite,
  onSave,
  onDelete,
}: {
  draft: Draft;
  onToggleFavorite: (id: number) => void;
  onSave: (id: number, title: string, content: string) => Promise<void>;
  onDelete: (id: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(draft.title);
  const [content, setContent] = useState(draft.content);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSave(draft.id, title, content);
      setIsEditing(false);
      toast.success("Draft updated");
    } catch {
      toast.error("Couldn't save changes.");
    } finally {
      setIsSaving(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(draft.content);
    toast.success("Copied to clipboard");
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        {isEditing ? (
          <>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Draft title" />
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              aria-label="Draft content"
            />
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{draft.title}</p>
              <button
                onClick={() => onToggleFavorite(draft.id)}
                aria-label={draft.is_favorite ? "Unfavorite" : "Favorite"}
              >
                <Star
                  className={`h-4 w-4 ${draft.is_favorite ? "fill-warning text-warning" : "text-muted-foreground"}`}
                />
              </button>
            </div>
            <p className="line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">
              {draft.content}
            </p>
          </>
        )}

        <div className="mt-1 flex items-center gap-2 border-t border-border/60 pt-3">
          {isEditing ? (
            <>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                <Save className="h-3.5 w-3.5" />
                {isSaving ? "Saving…" : "Save"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={copy} aria-label="Copy draft">
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportTextAsPdf(draft.title, draft.content)}
                aria-label="Download draft as PDF"
              >
                <FileDown className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} aria-label="Edit draft">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDelete(draft.id)} aria-label="Delete draft">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DraftsPage() {
  const {
    drafts,
    search,
    setSearch,
    favoritesOnly,
    setFavoritesOnly,
    isLoading,
    toggleFavorite,
    updateDraft,
    deleteDraft,
  } = useDrafts();

  async function handleDelete(id: number) {
    try {
      await deleteDraft(id);
      toast.success("Draft deleted");
    } catch {
      toast.error("Couldn't delete draft.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Drafts</h1>
        <p className="mt-1 text-muted-foreground">Replies you've saved for later.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search drafts…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant={favoritesOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setFavoritesOnly((v) => !v)}
        >
          <Star className="h-3.5 w-3.5" />
          Favorites only
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : drafts.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={FileText}
              title="No drafts found"
              description="Save a generated reply from the generator to see it here."
              actionHref="/generator"
              actionLabel="Open generator"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {drafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              onToggleFavorite={toggleFavorite}
              onSave={async (id, title, content) => {
  await updateDraft(id, { title, content });
}}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
