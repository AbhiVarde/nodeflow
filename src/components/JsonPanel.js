"use client";

import { useState } from "react";
import useFlowStore from "@/store/flowStore";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, Download, Upload, Check } from "lucide-react";

// Syntax highlight raw JSON string → HTML with color spans
const highlight = (str) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        if (/^"/.test(match))
          return /:$/.test(match)
            ? `<span style="color:#7dd3fc">${match}</span>`
            : `<span style="color:#86efac">${match}</span>`;
        if (/true|false/.test(match))
          return `<span style="color:#fde68a">${match}</span>`;
        if (/null/.test(match))
          return `<span style="color:#f9a8d4">${match}</span>`;
        return `<span style="color:#fb923c">${match}</span>`;
      },
    );

export default function JsonPanel() {
  const { getFlowJSON, importFlow, getValidationWarnings } = useFlowStore();
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState("");

  const json = getFlowJSON();
  const warnings = getValidationWarnings();
  const jsonString = JSON.stringify(json, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(
        new Blob([jsonString], { type: "application/json" }),
      ),
      download: "flow.json",
    });
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        importFlow(JSON.parse(ev.target.result));
      } catch {
        setImportError("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/70 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-300">
            JSON Preview
          </span>

          {warnings.length > 0 && (
            <span className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md">
              {warnings.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              size="sm"
              variant="ghost"
              asChild
              className="
        h-7 px-2 text-xs
        text-muted-foreground
        hover:text-foreground
        hover:bg-accent
      "
            >
              <span>
                <Upload className="w-3 h-3" />
                Import
              </span>
            </Button>
          </label>

          <Separator orientation="vertical" className="h-4 mx-1" />

          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="
            cursor-pointer
      h-7 px-2 text-xs
      text-muted-foreground
      hover:text-foreground
      hover:bg-accent
    "
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            className="
      cursor-pointer
      h-7 px-2 text-xs
      text-muted-foreground
      hover:text-foreground
      hover:bg-accent
    "
          >
            <Download className="w-3 h-3" />
            Download
          </Button>
        </div>
      </div>

      {/* Import error */}
      {importError && (
        <div className="px-3 py-2 text-xs text-red-400 border-b border-red-900/50 bg-red-950/30 shrink-0">
          {importError}
        </div>
      )}

      {/* Validation warnings */}
      {warnings.length > 0 && (
        <div className="px-3 py-2 border-b border-zinc-800/70 space-y-1 shrink-0">
          {warnings.map((w, i) => (
            <p key={i} className="text-xs text-amber-400">
              ⚠ {w}
            </p>
          ))}
        </div>
      )}

      {/* JSON Viewer */}
      <div className="flex-1 overflow-auto">
        <pre
          className="p-4 text-xs font-mono leading-relaxed text-zinc-300 min-w-max selection:bg-zinc-700/60"
          dangerouslySetInnerHTML={{ __html: highlight(jsonString) }}
        />
      </div>
    </div>
  );
}
