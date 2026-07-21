"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import type { Template } from "@/lib/types";

const SUGGESTED_CATEGORIES = ["Customer Support", "HR", "Sales", "Marketing", "Recruitment", "Internal Team"];

export function TemplateForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Template;
  onSubmit: (input: { name: string; category: string; prompt_text: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(
  initial?.category ?? SUGGESTED_CATEGORIES[0] ?? ""
);
  const [promptText, setPromptText] = useState(initial?.prompt_text ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ name, category, prompt_text: promptText });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="template-name">Name</Label>
        <Input
          id="template-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Refund request"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUGGESTED_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="template-prompt">Instructions</Label>
        <Textarea
          id="template-prompt"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="e.g. Always confirm the order number and apologize once, briefly."
          rows={4}
          required
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : initial ? "Save changes" : "Create template"}
        </Button>
      </DialogFooter>
    </form>
  );
}
