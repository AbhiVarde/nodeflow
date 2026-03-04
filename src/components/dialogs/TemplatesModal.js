"use client";

import useFlowStore, { FLOW_TEMPLATES } from "@/store/flowStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function TemplatesModal({ open, onClose }) {
  const { loadTemplate } = useFlowStore();

  const handleSelect = (templateId) => {
    loadTemplate(templateId);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Start from a Template
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            Loads a pre-built flow. Your current canvas will be replaced.
          </DialogDescription>
        </DialogHeader>

        <Separator className="dark:bg-zinc-800" />

        {/* Template cards — 2-column grid */}
        <div className="grid grid-cols-2 gap-2">
          {FLOW_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id)}
              className="
                text-left rounded-lg border border-zinc-200 dark:border-zinc-800
                bg-white dark:bg-zinc-950 p-3 space-y-1
                hover:border-zinc-400 dark:hover:border-zinc-600
                hover:bg-zinc-50 dark:hover:bg-zinc-900
                transition-all duration-150
              "
            >
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-tight">
                {t.name}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                {t.description}
              </p>
              {/* Node count as a subtle meta label */}
              <p className="text-[10px] text-zinc-400 dark:text-zinc-600 pt-0.5">
                {t.nodes.length} nodes
              </p>
            </button>
          ))}
        </div>

        <div className="flex justify-end pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs h-7 text-zinc-500"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
