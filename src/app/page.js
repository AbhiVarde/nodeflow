"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import FlowCanvas from "@/components/FlowCanvas";
import NodeSidebar from "@/components/NodeSidebar";
import JsonPanel from "@/components/JsonPanel";
import useFlowStore from "@/store/flowStore";

export default function Home() {
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleNodeClick = useCallback(
    (nodeId) => setSelectedNode(nodeId),
    [setSelectedNode],
  );

  return (
    <main className="w-screen h-screen flex flex-col overflow-hidden bg-white dark:bg-zinc-950">
      {/* Navbar */}
      <header className="h-11 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-black dark:bg-white flex items-center justify-center">
            <span className="text-white dark:text-black text-xs font-bold">
              F
            </span>
          </div>
          <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
            Flow Builder
          </span>
        </div>

        <span className="hidden md:block text-xs text-zinc-400 dark:text-zinc-500">
          Click node to edit · Drag handles to connect · Delete key to remove
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDark((d) => !d)}
          className="h-8 w-8 text-zinc-600 dark:text-zinc-400"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </header>

      {/* Main */}
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
