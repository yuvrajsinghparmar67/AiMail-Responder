import { Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { TONE_LABELS } from "@/lib/constants";
import type { EmailGeneration } from "@/lib/types";

export function RecentEmailsCard({ emails }: { emails: EmailGeneration[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent emails</CardTitle>
      </CardHeader>
      <CardContent>
        {emails.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No emails generated yet"
            description="Paste an incoming email into the generator to create your first reply."
            actionHref="/generator"
            actionLabel="Open generator"
          />
        ) : (
          <ul className="flex flex-col divide-y divide-border/60">
            {emails.map((email) => (
              <li key={email.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{email.incoming_text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {TONE_LABELS[email.tone] ?? email.tone} ·{" "}
                    {new Date(email.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
