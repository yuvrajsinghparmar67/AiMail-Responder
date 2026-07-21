"use client";

import { cn } from "@/lib/utils";
import { TONE_OPTIONS } from "@/lib/constants";
import type { Tone } from "@/lib/types";

export function ToneSelector({ value, onChange }: { value: Tone; onChange: (tone: Tone) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TONE_OPTIONS.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
            value === t.value
              ? "border-primary bg-primary/15 text-primary"
              : "border-border text-muted-foreground hover:border-border hover:bg-card/60 hover:text-foreground"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
