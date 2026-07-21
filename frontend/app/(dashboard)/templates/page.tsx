"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LayoutTemplate, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { TemplateForm } from "@/components/templates/template-form";
import { useTemplates } from "@/hooks/use-templates";
import type { Template } from "@/lib/types";

export default function TemplatesPage() {
  const { templates, isLoading, createTemplate, updateTemplate, deleteTemplate } = useTemplates();
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Template | undefined>(undefined);

  function openCreate() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(template: Template) {
    setEditing(template);
    setDialogOpen(true);
  }

  async function handleSubmit(input: { name: string; category: string; prompt_text: string }) {
    try {
      if (editing) {
        await updateTemplate(editing.id, input);
        toast.success("Template updated");
      } else {
        await createTemplate(input);
        toast.success("Template created");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Something went wrong. Try again.");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteTemplate(id);
      toast.success("Template deleted");
    } catch {
      toast.error("Couldn't delete template.");
    }
  }

  function useInGenerator(template: Template) {
    router.push(`/generator?templateId=${template.id}`);
  }

  const grouped = templates.reduce<Record<string, Template[]>>((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Templates</h1>
          <p className="mt-1 text-muted-foreground">Reusable instructions for common reply types.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New template
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={LayoutTemplate}
              title="No templates yet"
              description="Create a template for a common reply type — like refund requests or onboarding emails."
            />
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">{category}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((template) => (
                <Card key={template.id}>
                  <CardContent className="flex flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{template.name}</p>
                      <Badge>{template.category}</Badge>
                    </div>
                    <p className="line-clamp-3 text-sm text-muted-foreground">{template.prompt_text}</p>
                    <div className="mt-1 flex items-center gap-2 border-t border-border/60 pt-3">
                      <Button size="sm" variant="outline" onClick={() => useInGenerator(template)}>
                        <Sparkles className="h-3.5 w-3.5" />
                        Use
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(template)} aria-label="Edit template">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(template.id)} aria-label="Delete template">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit template" : "New template"}</DialogTitle>
          </DialogHeader>
          <TemplateForm initial={editing} onSubmit={handleSubmit} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
