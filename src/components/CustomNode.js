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
        w-40 rounded-lg border bg-card text-foreground cursor-pointer
        transition-all duration-150 shadow-xs overflow-hidden
        ${
          selected
            ? "border-foreground/40 shadow-sm"
            : "border-border hover:border-foreground/20"
        }
      `}
      // Tint the border with the node's custom color when one is set
      style={
        data.color
          ? { borderColor: selected ? data.color : `${data.color}66` }
          : {}
      }
    >
      {/* Thin color accent bar along the top edge */}
      {data.color && (
        <div className="h-0.5 w-full" style={{ backgroundColor: data.color }} />
      )}

      <Handle
        type="target"
        position={Position.Top}
        className="w-1.5! h-1.5! bg-muted-foreground! border border-card!"
      />

      <div className="px-2 py-1.5 space-y-0.5 leading-tight">
        {data.isStart && (
          <Badge
            variant="secondary"
            className="h-3 px-1 text-[8px] font-medium rounded-sm"
          >
            Start
          </Badge>
        )}

        <div className="py-0.5 space-y-0.5">
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

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-1.5! h-1.5! bg-foreground! border border-card!"
      />
    </div>
  );
}
