import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "@xyflow/react";

const MAX_HISTORY = 50;

// Deep clone nodes+edges for history snapshot
const snapshot = (state) => ({
  nodes: structuredClone(state.nodes),
  edges: structuredClone(state.edges),
});

const useFlowStore = create((set, get) => ({
  nodes: [
    {
      id: "start",
      type: "customNode",
      position: { x: 300, y: 150 },
      data: {
        label: "Start",
        description: "Starting node",
        isStart: true,
        edges: [],
      },
    },
  ],
  edges: [],
  selectedNode: null,
  errors: {},

  // Undo/redo history stacks
  past: [],
  future: [],

  // Push current state to past before any destructive action
  _save: () => {
    const state = get();
    set({
      past: [...state.past.slice(-MAX_HISTORY), snapshot(state)],
      future: [],
    });
  },

  undo: () => {
    const { past, nodes, edges } = get();
    if (!past.length) return;
    set({
      nodes: past[past.length - 1].nodes,
      edges: past[past.length - 1].edges,
      past: past.slice(0, -1),
      future: [snapshot({ nodes, edges }), ...get().future],
      selectedNode: null,
    });
  },

  redo: () => {
    const { future, nodes, edges } = get();
    if (!future.length) return;
    set({
      nodes: future[0].nodes,
      edges: future[0].edges,
      future: future.slice(1),
      past: [...get().past, snapshot({ nodes, edges })],
      selectedNode: null,
    });
  },

  onNodesChange: (changes) =>
    set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) })),

  onEdgesChange: (changes) =>
    set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),

  onConnect: (connection) => {
    get()._save();
    set((s) => ({
      edges: addEdge(
        { ...connection, label: "condition", animated: true },
        s.edges,
      ),
    }));
  },

  setSelectedNode: (nodeId) =>
    set((s) => ({
      selectedNode: s.nodes.find((n) => n.id === nodeId) || null,
    })),

  clearSelectedNode: () => set({ selectedNode: null }),

  addNode: () => {
    get()._save();
    const count = get().nodes.length + 1;
    set((s) => ({
      nodes: [
        ...s.nodes,
        {
          id: `node_${Date.now()}`,
          type: "customNode",
          position: {
            x: 150 + (count % 4) * 200,
            y: 100 + Math.floor(count / 4) * 180,
          },
          data: {
            label: `Node ${count}`,
            description: "",
            isStart: false,
            edges: [],
          },
        },
      ],
    }));
  },

  deleteNode: (nodeId) => {
    get()._save();
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== nodeId),
      edges: s.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNode: s.selectedNode?.id === nodeId ? null : s.selectedNode,
    }));
  },

  updateNodeData: (nodeId, newData) => {
    const { nodes } = get();
    const errors = {};
    if (newData.label !== undefined) {
      if (!newData.label?.trim()) errors.label = "Node name is required";
      else if (
        nodes.find((n) => n.data.label === newData.label && n.id !== nodeId)
      )
        errors.label = "Node name must be unique";
    }
    if (newData.description !== undefined && !newData.description?.trim())
      errors.description = "Description is required";

    set((s) => ({
      errors,
      nodes: s.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n,
      ),
      selectedNode:
        s.selectedNode?.id === nodeId
          ? { ...s.selectedNode, data: { ...s.selectedNode.data, ...newData } }
          : s.selectedNode,
    }));
  },

  setStartNode: (nodeId) =>
    set((s) => ({
      nodes: s.nodes.map((n) => ({
        ...n,
        data: { ...n.data, isStart: n.id === nodeId },
      })),
    })),

  addEdgeFromSidebar: (sourceId, targetId, condition) => {
    get()._save();
    set((s) => ({
      edges: [
        ...s.edges,
        {
          id: `e_${sourceId}_${targetId}_${Date.now()}`,
          source: sourceId,
          target: targetId,
          label: condition || "condition",
          animated: true,
        },
      ],
    }));
  },

  removeEdge: (edgeId) => {
    get()._save();
    set((s) => ({ edges: s.edges.filter((e) => e.id !== edgeId) }));
  },

  updateEdgeCondition: (edgeId, condition) =>
    set((s) => ({
      edges: s.edges.map((e) =>
        e.id === edgeId ? { ...e, label: condition } : e,
      ),
    })),

  // Export flow as Bolna-compatible JSON
  getFlowJSON: () => {
    const { nodes, edges } = get();
    return {
      nodes: nodes.map((n) => ({
        id: n.data.label,
        description: n.data.description,
        prompt: n.data.label,
        ...(n.data.isStart && { isStart: true }),
        edges: edges
          .filter((e) => e.source === n.id)
          .map((e) => ({
            to_node_id:
              nodes.find((nd) => nd.id === e.target)?.data.label || e.target,
            condition: e.label || "condition",
          })),
      })),
    };
  },

  // Encode entire flow into a shareable URL (using tinyurl.com API for brevity)
  getShareableURL: async () => {
    const { nodes, edges } = get();
    const encoded = btoa(
      unescape(encodeURIComponent(JSON.stringify({ nodes, edges }))),
    );
    const long = `${window.location.origin}${window.location.pathname}?flow=${encoded}`;

    try {
      const res = await fetch(
        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(long)}`,
      );
      const short = await res.text();
      return short; // e.g. https://tinyurl.com/abc123xy
    } catch {
      return long; // fallback to long URL if API fails
    }
  },

  // Decode flow from URL ?flow= param — call once on mount
  loadFromURL: () => {
    const param = new URLSearchParams(window.location.search).get("flow");
    if (!param) return false;
    try {
      const { nodes, edges } = JSON.parse(
        decodeURIComponent(escape(atob(param))),
      );
      if (nodes && edges) {
        set({ nodes, edges, selectedNode: null, errors: {} });
        window.history.replaceState({}, "", window.location.pathname);
        return true;
      }
    } catch {
      console.error("Invalid share URL");
    }
    return false;
  },

  importFlow: (json) => {
    try {
      const parsed = typeof json === "string" ? JSON.parse(json) : json;
      const newNodes = parsed.nodes.map((n, i) => ({
        id: `node_${i}_${Date.now()}`,
        type: "customNode",
        position: { x: 200 + i * 200, y: 150 + (i % 3) * 150 },
        data: {
          label: n.id,
          description: n.description || "",
          isStart: n.isStart || i === 0,
          edges: [],
        },
      }));
      const newEdges = [];
      parsed.nodes.forEach((n, i) => {
        (n.edges || []).forEach((e) => {
          const target = newNodes.find((nd) => nd.data.label === e.to_node_id);
          if (target)
            newEdges.push({
              id: `e_${Date.now()}_${Math.random()}`,
              source: newNodes[i].id,
              target: target.id,
              label: e.condition,
              animated: true,
            });
        });
      });
      set({ nodes: newNodes, edges: newEdges, selectedNode: null, errors: {} });
    } catch {
      console.error("Invalid JSON");
    }
  },

  getValidationWarnings: () => {
    const { nodes, edges } = get();
    const warnings = [];
    if (!nodes.some((n) => n.data.isStart))
      warnings.push("No start node defined");
    nodes.forEach((n) => {
      if (!n.data.description?.trim())
        warnings.push(`"${n.data.label}" has no description`);
      if (
        nodes.length > 1 &&
        !edges.some((e) => e.source === n.id || e.target === n.id)
      )
        warnings.push(`"${n.data.label}" is disconnected`);
    });
    return warnings;
  },
}));

export default useFlowStore;
