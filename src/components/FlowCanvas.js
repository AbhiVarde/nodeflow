"use client";

import { useCallback, useEffect, useState } from "react";
import { ReactFlow, Background, Controls, MiniMap, Panel } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import useFlowStore from "@/store/flowStore";
import CustomNode from "@/components/CustomNode";
import TemplatesModal from "./dialogs/TemplatesModal";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, LayoutTemplate } from "lucide-react";

// Register custom node type so ReactFlow knows how to render it
const nodeTypes = { customNode: CustomNode };

export default function FlowCanvas({ onNodeClick }) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteNode,
    selectedNode,
    clearSelectedNode,
    getValidationWarnings,
  } = useFlowStore();

  const [showTemplates, setShowTemplates] = useState(false);
  const warnings = getValidationWarnings();

  // Delete the selected node when the Delete key is pressed
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Delete" && selectedNode) deleteNode(selectedNode.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedNode, deleteNode]);

  const handleNodeClick = useCallback(
    (_e, node) => onNodeClick(node.id),
    [onNodeClick],
  );
  const handlePaneClick = useCallback(
    () => clearSelectedNode(),
    [clearSelectedNode],
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 1, maxZoom: 1.5 }}
        deleteKeyCode={null} // handled manually above so sidebar Delete key doesn't fire
      >
        <Background color="#e4e4e7" gap={24} size={1} />
        <Controls />

        {/* MiniMap reflects each node's custom color */}
        <MiniMap
          nodeColor={(n) =>
            n.data?.color || (n.data?.isStart ? "#000" : "#a1a1aa")
          }
          maskColor="rgba(0,0,0,0.04)"
        />

        {/* Top-left toolbar: Add Node, Templates, Delete (when a node is selected) */}
        <Panel position="top-left" className="flex items-center gap-2 m-3">
          <Button
            onClick={addNode}
            size="sm"
            className="bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white h-8 px-3 text-xs shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Node
          </Button>

          <Button
            onClick={() => setShowTemplates(true)}
            size="sm"
            variant="outline"
            className="border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400 h-8 px-3 text-xs shadow hover:border-zinc-500"
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            Templates
          </Button>

          {selectedNode && (
            <Button
              onClick={() => deleteNode(selectedNode.id)}
              size="sm"
              variant="outline"
              className="border-zinc-300 text-zinc-600 hover:text-red-500 hover:border-red-300 dark:border-zinc-700 dark:text-zinc-400 h-8 px-3 text-xs shadow"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          )}

          {warnings.length > 0 && (
            <span className="text-xs text-amber-500 font-medium ml-1">
              ⚠ {warnings.length} warning{warnings.length > 1 ? "s" : ""}
            </span>
          )}
        </Panel>
      </ReactFlow>

      <TemplatesModal
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
      />
    </div>
  );
}
