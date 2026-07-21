"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Copy, Check, RotateCcw, Save, Sparkles, Square, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { exportTextAsPdf } from "@/lib/pdf";

export function ReplyPanel({
  reply,
  isGenerating,
  hasGenerated,
  tokenUsage,
  onRegenerate,
  onStop,
  onSaveDraft,
  isSavingDraft,
}: {
  reply: string;
  isGenerating: boolean;
  hasGenerated: boolean;
  tokenUsage?: number;
  onRegenerate: () => void;
  onStop: () => void;
  onSaveDraft: () => void;
  isSavingDraft: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(reply);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  }

  if (!hasGenerated && !isGenerating) {
    return (
      <Card className="flex h-full min-h-[24rem] flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">Your reply will appear here</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Paste an email, pick a tone, and generate — the reply streams in live.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex h-full min-h-[24rem] flex-col">
      <CardContent className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex-1">
          {reply ? (
            <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{reply}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-3.5 animate-shimmer rounded bg-gradient-to-r from-muted via-card to-muted bg-[length:200%_100%]"
                  style={{ width: `${90 - i * 12}%` }}
                />
              ))}
            </div>
          )}
          {isGenerating && (
            <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-primary align-middle" />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
          <div className="text-xs text-muted-foreground">
            {tokenUsage !== undefined && !isGenerating && `~${tokenUsage.toLocaleString()} tokens`}
          </div>
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <Button variant="outline" size="sm" onClick={onStop}>
                <Square className="h-3.5 w-3.5" />
                Stop
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportTextAsPdf("Email reply", reply)}
                >
                  <FileDown className="h-3.5 w-3.5" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={onRegenerate}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Regenerate
                </Button>
                <Button size="sm" onClick={onSaveDraft} disabled={isSavingDraft}>
                  <Save className="h-3.5 w-3.5" />
                  {isSavingDraft ? "Saving…" : "Save draft"}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
