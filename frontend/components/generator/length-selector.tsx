"use client";

import { cn } from "@/lib/utils";
import { LENGTH_OPTIONS } from "@/lib/constants";
import type { ReplyLength } from "@/lib/types";

export function LengthSelector({
  value,
  onChange,
}: {
  value: ReplyLength;
  onChange: (length: ReplyLength) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-background/40 p-1">
      {LENGTH_OPTIONS.map((l) => (
        <button
          key={l.value}
          type="button"
          onClick={() => onChange(l.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            value === l.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
