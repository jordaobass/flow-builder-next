import { create } from 'zustand';
import { FlowNode, FlowEdge } from '@/types/flow';
import {
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Connection,
  MarkerType,
} from '@xyflow/react';

interface HistoryEntry {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

const MAX_HISTORY = 50;

interface BuilderStore {
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedNodeId: string | null;
  dirty: boolean;
  // Undo/Redo
  history: HistoryEntry[];
  historyIndex: number;
  // Actions
  setNodes: (nodes: FlowNode[]) => void;
  setEdges: (edges: FlowEdge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: FlowNode) => void;
  updateNodeData: (id: string, data: Partial<FlowNode['data']>) => void;
  removeNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  setDirty: (dirty: boolean) => void;
  reset: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

function pushHistory(state: { nodes: FlowNode[]; edges: FlowEdge[]; history: HistoryEntry[]; historyIndex: number }) {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push({ nodes: state.nodes, edges: state.edges });
  if (newHistory.length > MAX_HISTORY) newHistory.shift();
  return { history: newHistory, historyIndex: newHistory.length - 1 };
}

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  dirty: false,
  history: [],
  historyIndex: -1,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    const prev = get();
    const newNodes = applyNodeChanges(changes, prev.nodes) as FlowNode[];
    const hist = pushHistory(prev);
    set({
      nodes: newNodes,
      dirty: true,
      ...hist,
    });
  },

  onEdgesChange: (changes) => {
    const prev = get();
    const newEdges = applyEdgeChanges(changes, prev.edges) as FlowEdge[];
    const hist = pushHistory(prev);
    set({
      edges: newEdges,
      dirty: true,
      ...hist,
    });
  },

  onConnect: (connection) => {
    const prev = get();
    const sourceNode = prev.nodes.find((n) => n.id === connection.source);
    let edgeProps: Partial<FlowEdge> = {};

    if (sourceNode?.type === 'condition' && connection.sourceHandle) {
      const isTrue = connection.sourceHandle === 'true';
      edgeProps = {
        label: isTrue ? 'Yes' : 'No',
        style: { stroke: isTrue ? '#22c55e' : '#ef4444', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: isTrue ? '#22c55e' : '#ef4444' },
      };
    }

    const edge: FlowEdge = {
      id: `e_${connection.source}_${connection.sourceHandle ?? 'default'}_${connection.target}`,
      source: connection.source!,
      target: connection.target!,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      ...edgeProps,
    };

    const hist = pushHistory(prev);
    set({
      edges: [...prev.edges, edge],
      dirty: true,
      ...hist,
    });
  },

  addNode: (node) => {
    const prev = get();
    const hist = pushHistory(prev);
    set({ nodes: [...prev.nodes, node], dirty: true, ...hist });
  },

  updateNodeData: (id, data) => {
    const prev = get();
    const hist = pushHistory(prev);
    set({
      nodes: prev.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ) as FlowNode[],
      dirty: true,
      ...hist,
    });
  },

  removeNode: (id) => {
    const prev = get();
    const hist = pushHistory(prev);
    set({
      nodes: prev.nodes.filter((n) => n.id !== id),
      edges: prev.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: prev.selectedNodeId === id ? null : prev.selectedNodeId,
      dirty: true,
      ...hist,
    });
  },

  selectNode: (id) => set({ selectedNodeId: id }),

  setDirty: (dirty) => set({ dirty }),

  reset: () =>
    set({ nodes: [], edges: [], selectedNodeId: null, dirty: false, history: [], historyIndex: -1 }),

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < 0) return;
    const entry = history[historyIndex];
    set({
      nodes: entry.nodes,
      edges: entry.edges,
      historyIndex: historyIndex - 1,
      dirty: true,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const entry = history[historyIndex + 2] ?? history[historyIndex + 1];
    if (!entry) return;
    set({
      nodes: entry.nodes,
      edges: entry.edges,
      historyIndex: historyIndex + 1,
      dirty: true,
    });
  },

  canUndo: () => get().historyIndex >= 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
}));
