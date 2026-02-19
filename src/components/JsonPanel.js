"use client";

import { useState } from "react";
import useFlowStore from "@/store/flowStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, Download, Upload, Check } from "lucide-react";

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
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flow.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        importFlow(JSON.parse(event.target.result));
      } catch {
        setImportError("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Fixed syntax highlighter — no more 400> bug
  const highlight = (str) => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
          if (/^"/.test(match)) {
            if (/:$/.test(match))
              return `<span style="color:#7dd3fc">${match}</span>`; // key - blue
            return `<span style="color:#86efac">${match}</span>`; // string - green
          }
          if (/true|false/.test(match))
            return `<span style="color:#fde68a">${match}</span>`; // yellow
          if (/null/.test(match))
            return `<span style="color:#f9a8d4">${match}</span>`; // pink
          return `<span style="color:#fb923c">${match}</span>`; // number - orange
        },
      );
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            JSON
          </span>
          {warnings.length > 0 && (
            <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full font-medium">
              {warnings.length} warning{warnings.length > 1 ? "s" : ""}
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
              className="h-7 px-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              asChild
            >
              <span>
                <Upload className="w-3 h-3 " />
                Import
              </span>
            </Button>
          </label>

          <Separator orientation="vertical" className="h-4 bg-zinc-700 mx-1" />

          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-7 px-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            {copied ? (
              <Check className="w-3 h-3  text-green-400" />
            ) : (
              <Copy className="w-3 h-3 " />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            className="h-7 px-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            <Download className="w-3 h-3 " />
            Download
          </Button>
        </div>
      </div>

      {/* Import error */}
      {importError && (
        <div className="px-4 py-2 bg-red-950 border-b border-red-800 shrink-0">
          <p className="text-xs text-red-400">{importError}</p>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="px-4 py-2 border-b border-zinc-800 space-y-1 shrink-0">
          {warnings.map((w, i) => (
            <p
              key={i}
              className="text-xs text-amber-400 flex gap-1.5 items-start"
            >
              <span className="mt-px">⚠</span>
              {w}
            </p>
          ))}
        </div>
      )}

      {/* JSON */}
      <div className="flex-1 overflow-auto">
        <pre
          className="p-4 text-xs font-mono leading-relaxed text-zinc-300 min-w-max"
          dangerouslySetInnerHTML={{ __html: highlight(jsonString) }}
        />
      </div>
    </div>
  );
}
