"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Share2, Check, Undo2, Redo2 } from "lucide-react";
import FlowCanvas from "@/components/FlowCanvas";
import NodeSidebar from "@/components/NodeSidebar";
import JsonPanel from "@/components/JsonPanel";
import useFlowStore from "@/store/flowStore";

export default function Home() {
  const {
    setSelectedNode,
    loadFromURL,
    getShareableURL,
    undo,
    redo,
    past,
    future,
  } = useFlowStore();
  const [dark, setDark] = useState(true);
  const [copied, setCopied] = useState(false);

  // Apply dark mode class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Load shared flow from URL on first render
  useEffect(() => {
    loadFromURL();
  }, []);

  // Keyboard shortcuts: Ctrl+Z undo, Ctrl+Shift+Z redo
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.key === "z" && !e.shiftKey) undo();
      if (e.ctrlKey && e.key === "z" && e.shiftKey) redo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const handleNodeClick = useCallback(
    (nodeId) => setSelectedNode(nodeId),
    [setSelectedNode],
  );

  const handleShare = async () => {
    const url = await getShareableURL();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="w-screen h-screen flex flex-col overflow-hidden bg-white dark:bg-zinc-950">
      <header className="h-11 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between px-4 shrink-0">
        {/* App Name */}
        <span className="font-medium text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
          NodeFlow
        </span>

        {/* Helper text */}
        <span className="hidden md:block text-[11px] text-zinc-400 dark:text-zinc-500">
          Click node to edit · Drag handles to connect · Delete to remove
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={!past.length}
            title="Undo (Ctrl+Z)"
            className="cursor-pointer h-8 w-8 text-zinc-500 dark:text-zinc-400 disabled:opacity-30"
          >
            <Undo2 className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={!future.length}
            title="Redo (Ctrl+Shift+Z)"
            className="cursor-pointer h-8 w-8 text-zinc-500 dark:text-zinc-400 disabled:opacity-30"
          >
            <Redo2 className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="cursor-pointer h-8 px-2 text-xs gap-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied" : "Share"}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDark((d) => !d)}
            className="cursor-pointer h-8 w-8 text-zinc-600 dark:text-zinc-400"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={65} minSize={35}>
            <FlowCanvas onNodeClick={handleNodeClick} />
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className="bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors w-1"
          />

          <ResizablePanel defaultSize={35} minSize={20}>
            <JsonPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <NodeSidebar />
    </main>
  );
}
