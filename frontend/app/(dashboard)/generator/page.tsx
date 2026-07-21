"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToneSelector } from "@/components/generator/tone-selector";
import { LengthSelector } from "@/components/generator/length-selector";
import { LanguageSelector } from "@/components/generator/language-selector";
import { ReplyPanel } from "@/components/generator/reply-panel";
import { VariationsPanel } from "@/components/generator/variations-panel";
import { useEmailGenerator } from "@/hooks/use-email-generator";
import { api, ApiError } from "@/lib/api";
import type { Template } from "@/lib/types";

function GeneratorPageContent() {
  const g = useEmailGenerator();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");

  // Prefill custom instructions from a template selected on the Templates page.
  useEffect(() => {
    if (!templateId) return;
    let cancelled = false;
    api
      .get<Template>(`/api/templates/${templateId}`)
      .then((template) => {
        if (cancelled) return;
        g.setCustomInstructions(template.prompt_text);
        toast.success(`Loaded "${template.name}" template`);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err instanceof ApiError ? err.message : "Couldn't load that template.");
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  // Surface stream/generation errors as toasts without blocking the UI.
  useEffect(() => {
    if (g.error) toast.error(g.error);
  }, [g.error]);

  const displayedReply = g.currentGeneration?.generated_reply ?? g.streamedReply;
  const hasGenerated = Boolean(g.currentGeneration) || g.streamedReply.length > 0;

  async function handleSaveDraft(content: string) {
    const ok = await g.saveDraft(content);
    if (ok) toast.success("Saved to drafts");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Generator</h1>
        <p className="mt-1 text-muted-foreground">
          Paste an incoming email, choose a tone, and get a polished reply.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* --- Input side ------------------------------------------------- */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Incoming email</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <Textarea
              placeholder="Paste the email you're replying to…"
              rows={8}
              value={g.incomingText}
              onChange={(e) => g.setIncomingText(e.target.value)}
            />

            <div className="flex flex-col gap-2">
              <Label>Tone</Label>
              <ToneSelector value={g.tone} onChange={g.setTone} />
            </div>

            <div className="flex flex-wrap items-end gap-6">
              <div className="flex flex-col gap-2">
                <Label>Length</Label>
                <LengthSelector value={g.length} onChange={g.setLength} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Language</Label>
                <LanguageSelector value={g.language} onChange={g.setLanguage} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="instructions">Custom instructions (optional)</Label>
              <Textarea
                id="instructions"
                placeholder="e.g. Mention that the shipment left the warehouse yesterday"
                rows={2}
                value={g.customInstructions}
                onChange={(e) => g.setCustomInstructions(e.target.value)}
              />
            </div>

            <Button
              size="lg"
              onClick={g.generate}
              disabled={g.isGenerating || !g.incomingText.trim()}
            >
              {g.isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {g.isGenerating ? "Generating…" : "Generate reply"}
            </Button>
          </CardContent>
        </Card>

        {/* --- Output side -------------------------------------------------- */}
        <ReplyPanel
          reply={displayedReply}
          isGenerating={g.isGenerating}
          hasGenerated={hasGenerated}
          tokenUsage={g.currentGeneration?.token_usage}
          onRegenerate={g.regenerate}
          onStop={g.stop}
          onSaveDraft={() => handleSaveDraft(displayedReply)}
          isSavingDraft={g.isSavingDraft}
        />
      </div>

      <VariationsPanel
        variations={g.variations}
        isLoading={g.isGeneratingVariations}
        onGenerate={() => g.fetchVariations(3)}
        onSave={handleSaveDraft}
      />
    </div>
  );
}

export default function GeneratorPage() {
  return (
    <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}>
      <GeneratorPageContent />
    </Suspense>
  );
}
