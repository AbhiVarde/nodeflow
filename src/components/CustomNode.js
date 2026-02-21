"use client";

import { Handle, Position } from "@xyflow/react";
import useFlowStore from "@/store/flowStore";
import { Badge } from "@/components/ui/badge";

export default function CustomNode({ data, id, selected }) {
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);

  return (
    <div
      onClick={() => setSelectedNode(id)}
      className={`
        w-36 rounded-lg border bg-card text-foreground cursor-pointer
        transition-all duration-150 shadow-xs
        ${
          selected
            ? "border-foreground/40 shadow-sm"
            : "border-border hover:border-foreground/20"
        }
      `}
    >
      {/* Target Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-1.5! h-1.5! bg-muted-foreground! border border-card!"
      />

      {/* Content */}
      <div className="px-2 py-1.5 leading-tight space-y-0.5">
        {data.isStart && (
          <Badge
            variant="secondary"
            className="h-3 px-1 text-[8px] font-medium rounded-sm"
          >
            Start
          </Badge>
        )}

        <div className="py-0.5 space-y-0.5 leading-tight">
          <p className="text-[11px] font-medium truncate">{data.label}</p>

          {data.description ? (
            <p className="text-[10px] text-muted-foreground truncate">
              {data.description}
            </p>
          ) : (
            <p className="text-[10px] text-destructive">No description</p>
          )}
        </div>
      </div>

      {/* Source Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-1.5! h-1.5! bg-foreground! border border-card!"
      />
    </div>
  );
}
