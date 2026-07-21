import { FileText, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import type { Draft } from "@/lib/types";

export function RecentDraftsCard({ drafts }: { drafts: Draft[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Saved drafts</CardTitle>
      </CardHeader>
      <CardContent>
        {drafts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No drafts saved yet"
            description="Save a generated reply to come back to it later."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-border/60">
            {drafts.map((draft) => (
              <li key={draft.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{draft.title}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{draft.content}</p>
                </div>
                {draft.is_favorite && (
                  <Star className="h-4 w-4 shrink-0 fill-warning text-warning" />
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
