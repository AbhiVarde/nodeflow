"use client";

import { Handle, Position } from "@xyflow/react";
import useFlowStore from "@/store/flowStore";

export default function CustomNode({ data, id, selected }) {
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);

  return (
    <div
      onClick={() => setSelectedNode(id)}
      className={`
        w-[160px] rounded-lg border bg-white dark:bg-zinc-900 cursor-pointer
        transition-all duration-150 shadow-sm
        ${
          selected
            ? "border-black dark:border-white shadow-md"
            : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
        }
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-zinc-400 !border-2 !border-white dark:!border-zinc-900"
      />

      <div className="px-2.5 py-2 space-y-0.5">
        {data.isStart && (
          <span className="inline-block text-[9px] font-bold uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black px-1.5 py-0.5 rounded-full mb-1">
            Start
          </span>
        )}
        <p className="font-medium text-xs text-zinc-900 dark:text-zinc-100 truncate">
          {data.label}
        </p>
        {data.description ? (
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
            {data.description}
          </p>
        ) : (
          <p className="text-[10px] text-red-400">⚠ No description</p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-zinc-900 dark:!bg-zinc-100 !border-2 !border-white dark:!border-zinc-900"
      />
    </div>
  );
}
