import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "@xyflow/react";

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

  // ── Node changes (drag, select, remove) ──
  onNodesChange: (changes) =>
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),

  // ── Edge changes ──
  onEdgesChange: (changes) =>
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),

  // ── Connect two nodes by drawing ──
  onConnect: (connection) =>
    set((state) => ({
      edges: addEdge(
        { ...connection, label: "condition", animated: true },
        state.edges,
      ),
    })),

  // ── Select a node (click) ──
  setSelectedNode: (nodeId) =>
    set((state) => ({
      selectedNode: state.nodes.find((n) => n.id === nodeId) || null,
    })),

  clearSelectedNode: () => set({ selectedNode: null }),

  // ── Add a new node ──
  addNode: () => {
    const state = get();
    const count = state.nodes.length + 1;
    const id = `node_${Date.now()}`;
    const newNode = {
      id,
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
    };
    set((state) => ({ nodes: [...state.nodes, newNode] }));
  },

  // ── Delete a node ──
  deleteNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId,
      ),
      selectedNode:
        state.selectedNode?.id === nodeId ? null : state.selectedNode,
    })),

  // ── Update node data from sidebar ──
  updateNodeData: (nodeId, newData) => {
    const state = get();

    // Validate unique ID
    const errors = {};
    if (newData.label !== undefined) {
      const duplicate = state.nodes.find(
        (n) => n.data.label === newData.label && n.id !== nodeId,
      );
      if (duplicate) errors.label = "Node name must be unique";
      if (!newData.label.trim()) errors.label = "Node name is required";
    }
    if (newData.description !== undefined && !newData.description.trim()) {
      errors.description = "Description is required";
    }

    set((state) => ({
      errors,
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n,
      ),
      selectedNode:
        state.selectedNode?.id === nodeId
          ? {
              ...state.selectedNode,
              data: { ...state.selectedNode.data, ...newData },
            }
          : state.selectedNode,
    }));
  },

  // ── Mark a node as start ──
  setStartNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.map((n) => ({
        ...n,
        data: { ...n.data, isStart: n.id === nodeId },
      })),
    })),

  // ── Add outgoing edge from sidebar ──
  addEdgeFromSidebar: (sourceId, targetId, condition) => {
    const newEdge = {
      id: `e_${sourceId}_${targetId}_${Date.now()}`,
      source: sourceId,
      target: targetId,
      label: condition || "condition",
      animated: true,
    };
    set((state) => ({ edges: [...state.edges, newEdge] }));
  },

  // ── Remove edge ──
  removeEdge: (edgeId) =>
    set((state) => ({ edges: state.edges.filter((e) => e.id !== edgeId) })),

  // ── Update edge condition label ──
  updateEdgeCondition: (edgeId, condition) =>
    set((state) => ({
      edges: state.edges.map((e) =>
        e.id === edgeId ? { ...e, label: condition } : e,
      ),
    })),

  // ── Generate JSON export ──
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

  // ── Import JSON to reconstruct flow ──
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
          const targetNode = newNodes.find(
            (nd) => nd.data.label === e.to_node_id,
          );
          if (targetNode) {
            newEdges.push({
              id: `e_${Date.now()}_${Math.random()}`,
              source: newNodes[i].id,
              target: targetNode.id,
              label: e.condition,
              animated: true,
            });
          }
        });
      });

      set({ nodes: newNodes, edges: newEdges, selectedNode: null, errors: {} });
    } catch {
      console.error("Invalid JSON");
    }
  },

  // ── Validation checks ──
  getValidationWarnings: () => {
    const { nodes, edges } = get();
    const warnings = [];

    const hasStart = nodes.some((n) => n.data.isStart);
    if (!hasStart) warnings.push("No start node defined");

    nodes.forEach((n) => {
      if (!n.data.description?.trim()) {
        warnings.push(`Node "${n.data.label}" has no description`);
      }
      const isConnected = edges.some(
        (e) => e.source === n.id || e.target === n.id,
      );
      if (!isConnected && nodes.length > 1) {
        warnings.push(`Node "${n.data.label}" is disconnected`);
      }
    });

    return warnings;
  },
}));

export default useFlowStore;
