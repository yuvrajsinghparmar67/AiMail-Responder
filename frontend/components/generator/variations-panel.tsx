"use client";

import { Copy, Loader2, Save, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface VariationItem {
  generated_reply: string;
  token_usage: number;
}

export function VariationsPanel({
  variations,
  isLoading,
  onGenerate,
  onSave,
}: {
  variations: VariationItem[];
  isLoading: boolean;
  onGenerate: () => void;
  onSave: (content: string) => void;
}) {
  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Variations</h3>
          <p className="text-sm text-muted-foreground">Compare a few alternate takes side by side.</p>
        </div>
        <Button variant="outline" onClick={onGenerate} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          Generate variations
        </Button>
      </div>

      {variations.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {variations.map((v, i) => (
            <Card key={i}>
              <CardContent className="flex flex-col gap-3 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{v.generated_reply}</p>
                <div className="flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-xs text-muted-foreground">
                    ~{v.token_usage.toLocaleString()} tokens
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => copy(v.generated_reply)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onSave(v.generated_reply)}>
                      <Save className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
