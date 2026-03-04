"use client";

import { useEffect, useState } from "react";
import useFlowStore, { NODE_COLORS } from "@/store/flowStore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";

export default function NodeSidebar() {
  const {
    selectedNode,
    clearSelectedNode,
    updateNodeData,
    setStartNode,
    addEdgeFromSidebar,
    removeEdge,
    updateEdgeCondition,
    deleteNode,
    nodes,
    edges,
    errors,
  } = useFlowStore();

  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newCondition, setNewCondition] = useState("");

  // Sync local fields whenever the selected node changes
  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label || "");
      setDescription(selectedNode.data.description || "");
      setNewTarget("");
      setNewCondition("");
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  const outgoingEdges = edges.filter((e) => e.source === selectedNode.id);
  const availableTargets = nodes.filter((n) => n.id !== selectedNode.id);
  const getNodeLabel = (nodeId) =>
    nodes.find((n) => n.id === nodeId)?.data.label || nodeId;

  const handleAddEdge = () => {
    if (!newTarget) return;
    addEdgeFromSidebar(selectedNode.id, newTarget, newCondition || "condition");
    setNewTarget("");
    setNewCondition("");
  };

  return (
    <Sheet
      open={!!selectedNode}
      onOpenChange={(open) => !open && clearSelectedNode()}
    >
      <SheetContent
        side="right"
        className="w-85 sm:w-95 flex flex-col gap-0 p-0 bg-white dark:bg-zinc-950"
      >
        <SheetHeader className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <SheetTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Edit Node
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Node name */}
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-500 dark:text-zinc-400">
              Node Name
            </Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={() => updateNodeData(selectedNode.id, { label })}
              placeholder="Enter node name"
              className={`h-8 text-sm ${errors.label ? "border-red-400" : ""}`}
            />
            {errors.label && (
              <p className="text-xs text-red-500">{errors.label}</p>
            )}
          </div>

          {/* Node description */}
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-500 dark:text-zinc-400">
              Description
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => updateNodeData(selectedNode.id, { description })}
              placeholder="What does this node do?"
              rows={3}
              className={`text-sm resize-none ${errors.description ? "border-red-400" : ""}`}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Color picker — circle swatches, selected swatch gets a ring */}
          <div className="space-y-2">
            <Label className="text-xs text-zinc-500 dark:text-zinc-400">
              Node Color
            </Label>
            <div className="flex flex-wrap gap-2">
              {NODE_COLORS.map((c) => (
                <button
                  key={c.label}
                  title={c.label}
                  onClick={() =>
                    updateNodeData(selectedNode.id, { color: c.value })
                  }
                  className={`
                    w-5 h-5 rounded-full border-2 transition-all duration-100
                    ${
                      selectedNode.data.color === c.value
                        ? "border-zinc-900 dark:border-zinc-100 scale-110"
                        : "border-transparent hover:scale-105"
                    }
                    ${!c.value ? "bg-zinc-200 dark:bg-zinc-700" : ""}
                  `}
                  style={c.value ? { backgroundColor: c.value } : {}}
                />
              ))}
            </div>
          </div>

          {/* Start node toggle */}
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs text-zinc-500 dark:text-zinc-400">
              Start Node
            </Label>
            {selectedNode.data.isStart ? (
              <span className="text-[10px] font-semibold uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black px-2.5 py-1 rounded-full">
                Active
              </span>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => setStartNode(selectedNode.id)}
              >
                Set as Start
              </Button>
            )}
          </div>

          <Separator className="dark:bg-zinc-800" />

          {/* Outgoing edges list */}
          <div className="space-y-2">
            <Label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Outgoing Edges ({outgoingEdges.length})
            </Label>

            {outgoingEdges.length === 0 && (
              <p className="text-xs text-zinc-400 py-1">No edges yet.</p>
            )}

            {outgoingEdges.map((edge) => (
              <div
                key={edge.id}
                className="border border-zinc-100 dark:border-zinc-800 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    → {getNodeLabel(edge.target)}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-6 h-6 text-zinc-400 hover:text-red-500"
                    onClick={() => removeEdge(edge.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <Input
                  value={edge.label || ""}
                  onChange={(e) => updateEdgeCondition(edge.id, e.target.value)}
                  placeholder="Condition"
                  className="h-7 text-xs"
                />
              </div>
            ))}
          </div>

          {/* Add edge form */}
          <div className="border border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg p-3 space-y-2">
            <Label className="text-xs text-zinc-500 dark:text-zinc-400">
              Add Edge
            </Label>

            {/* shadcn Select instead of a raw <select> */}
            <Select value={newTarget} onValueChange={setNewTarget}>
              <SelectTrigger className="h-8 text-xs w-full">
                <SelectValue placeholder="Select target node…" />
              </SelectTrigger>
              <SelectContent className="w-full">
                {availableTargets.map((n) => (
                  <SelectItem key={n.id} value={n.id} className="text-xs">
                    {n.data.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              placeholder="Condition text"
              className="h-7 text-xs"
            />

            <Button
              size="sm"
              onClick={handleAddEdge}
              disabled={!newTarget}
              className="w-full h-7 text-xs bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              <Plus className="w-3 h-3" /> Add Edge
            </Button>
          </div>
        </div>

        {/* Delete node — pinned to the bottom of the sheet */}
        <div className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950 text-xs h-8"
            onClick={() => {
              deleteNode(selectedNode.id);
              clearSelectedNode();
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Node
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
