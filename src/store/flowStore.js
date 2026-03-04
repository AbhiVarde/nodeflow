import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "@xyflow/react";

const MAX_HISTORY = 50;

// Captures a deep-cloned snapshot of nodes+edges for the undo/redo stacks
const snapshot = (state) => ({
  nodes: structuredClone(state.nodes),
  edges: structuredClone(state.edges),
});

// Color swatches shown in the node sidebar picker
export const NODE_COLORS = [
  { label: "Default", value: null },
  { label: "Blue", value: "#3b82f6" },
  { label: "Green", value: "#22c55e" },
  { label: "Purple", value: "#8b5cf6" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Red", value: "#ef4444" },
  { label: "Teal", value: "#10b981" },
  { label: "Indigo", value: "#6366f1" },
  { label: "Pink", value: "#ec4899" },
  { label: "Gray", value: "#6b7280" },
];

// Pre-built flows users can load via the Templates button on the canvas
export const FLOW_TEMPLATES = [
  {
    id: "customer-support",
    name: "Customer Support Bot",
    description: "Handle user issues with escalation paths",
    nodes: [
      {
        id: "Greet User",
        description: "Welcome the user and ask how to help",
        isStart: true,
        color: "#22c55e",
        edges: [{ to_node_id: "Identify Issue", condition: "user responds" }],
      },
      {
        id: "Identify Issue",
        description: "Categorize the user's problem",
        isStart: false,
        color: "#3b82f6",
        edges: [
          { to_node_id: "Resolve Issue", condition: "issue identified" },
          { to_node_id: "Escalate", condition: "complex issue" },
        ],
      },
      {
        id: "Resolve Issue",
        description: "Provide solution or steps to fix",
        isStart: false,
        color: "#8b5cf6",
        edges: [
          { to_node_id: "Follow Up", condition: "resolved" },
          { to_node_id: "Escalate", condition: "unresolved" },
        ],
      },
      {
        id: "Escalate",
        description: "Transfer to a human agent",
        isStart: false,
        color: "#f59e0b",
        edges: [],
      },
      {
        id: "Follow Up",
        description: "Check if the user is satisfied",
        isStart: false,
        color: "#10b981",
        edges: [],
      },
    ],
  },
  {
    id: "onboarding",
    name: "User Onboarding Flow",
    description: "Guide new users through setup steps",
    nodes: [
      {
        id: "Welcome",
        description: "Introduce the product and its value",
        isStart: true,
        color: "#6366f1",
        edges: [{ to_node_id: "Collect Info", condition: "user clicks start" }],
      },
      {
        id: "Collect Info",
        description: "Ask for name, email, and preferences",
        isStart: false,
        color: "#3b82f6",
        edges: [{ to_node_id: "Setup Profile", condition: "info submitted" }],
      },
      {
        id: "Setup Profile",
        description: "Create the user account and profile",
        isStart: false,
        color: "#8b5cf6",
        edges: [{ to_node_id: "Feature Tour", condition: "profile created" }],
      },
      {
        id: "Feature Tour",
        description: "Highlight key features interactively",
        isStart: false,
        color: "#f59e0b",
        edges: [{ to_node_id: "Complete", condition: "tour finished" }],
      },
      {
        id: "Complete",
        description: "Celebrate completion and show next steps",
        isStart: false,
        color: "#22c55e",
        edges: [],
      },
    ],
  },
  {
    id: "faq-handler",
    name: "FAQ Handler",
    description: "Answer common questions with smart routing",
    nodes: [
      {
        id: "Receive Question",
        description: "Capture the user's question",
        isStart: true,
        color: "#3b82f6",
        edges: [{ to_node_id: "Match FAQ", condition: "question received" }],
      },
      {
        id: "Match FAQ",
        description: "Find the best matching FAQ entry",
        isStart: false,
        color: "#8b5cf6",
        edges: [
          { to_node_id: "Answer", condition: "match found" },
          { to_node_id: "Clarify", condition: "ambiguous" },
          { to_node_id: "No Match", condition: "no match" },
        ],
      },
      {
        id: "Answer",
        description: "Return the matched FAQ answer",
        isStart: false,
        color: "#22c55e",
        edges: [{ to_node_id: "Satisfied?", condition: "answer given" }],
      },
      {
        id: "Clarify",
        description: "Ask a follow-up to narrow down intent",
        isStart: false,
        color: "#f59e0b",
        edges: [
          { to_node_id: "Match FAQ", condition: "clarification received" },
        ],
      },
      {
        id: "No Match",
        description: "Escalate or suggest the contact form",
        isStart: false,
        color: "#ef4444",
        edges: [],
      },
      {
        id: "Satisfied?",
        description: "Check if the answer helped",
        isStart: false,
        color: "#10b981",
        edges: [
          { to_node_id: "Receive Question", condition: "has another question" },
        ],
      },
    ],
  },
  {
    id: "lead-qualifier",
    name: "Lead Qualification",
    description: "Score and route inbound sales leads",
    nodes: [
      {
        id: "Capture Lead",
        description: "Collect contact and company info",
        isStart: true,
        color: "#6366f1",
        edges: [{ to_node_id: "Score Lead", condition: "form submitted" }],
      },
      {
        id: "Score Lead",
        description: "Apply scoring model to the lead",
        isStart: false,
        color: "#3b82f6",
        edges: [
          { to_node_id: "Hot Lead", condition: "score > 80" },
          { to_node_id: "Warm Lead", condition: "score 40–80" },
          { to_node_id: "Cold Lead", condition: "score < 40" },
        ],
      },
      {
        id: "Hot Lead",
        description: "Immediately assign to a sales rep",
        isStart: false,
        color: "#ef4444",
        edges: [],
      },
      {
        id: "Warm Lead",
        description: "Add to nurture email sequence",
        isStart: false,
        color: "#f59e0b",
        edges: [],
      },
      {
        id: "Cold Lead",
        description: "Add to low-priority drip campaign",
        isStart: false,
        color: "#6b7280",
        edges: [],
      },
    ],
  },
];

// Converts a template node definition into a ReactFlow node with grid positioning
const buildNodeFromTemplate = (templateNode, index) => ({
  id: `node_${index}_${Date.now()}`,
  type: "customNode",
  position: {
    x: 200 + (index % 3) * 240,
    y: 100 + Math.floor(index / 3) * 200,
  },
  data: {
    label: templateNode.id,
    description: templateNode.description || "",
    isStart: templateNode.isStart || false,
    color: templateNode.color || null,
  },
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
        color: null,
      },
    },
  ],
  edges: [],
  selectedNode: null,
  errors: {},
  past: [],
  future: [],

  // Saves current state to past stack before any destructive action
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
            color: null,
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

  // Validates label uniqueness + description presence, then applies partial data update
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
      // Mirror update in selectedNode so the sidebar stays in sync
      selectedNode:
        s.selectedNode?.id === nodeId
          ? { ...s.selectedNode, data: { ...s.selectedNode.data, ...newData } }
          : s.selectedNode,
    }));
  },

  // Marks exactly one node as the start by resetting all others first
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

  // Replaces the canvas with nodes and edges built from the selected template
  loadTemplate: (templateId) => {
    get()._save();
    const template = FLOW_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    const newNodes = template.nodes.map(buildNodeFromTemplate);

    const newEdges = [];
    template.nodes.forEach((tNode, i) => {
      (tNode.edges || []).forEach((e) => {
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
  },

  // Serialises the flow into Bolna-compatible JSON for the preview panel and download
  getFlowJSON: () => {
    const { nodes, edges } = get();
    return {
      nodes: nodes.map((n) => ({
        id: n.data.label,
        description: n.data.description,
        prompt: n.data.label,
        ...(n.data.isStart && { isStart: true }),
        ...(n.data.color && { color: n.data.color }),
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

  // Base64-encodes the flow into the URL, then shortens it via TinyURL
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
      return await res.text();
    } catch {
      return long; // fall back to the long URL if TinyURL is unavailable
    }
  },

  // Reads ?flow= from the URL on mount and restores the encoded flow
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

  // Parses a Bolna-compatible JSON file and rebuilds nodes/edges from it
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
          color: n.color || null,
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

  // Returns human-readable warnings surfaced in the JSON panel and canvas toolbar
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
