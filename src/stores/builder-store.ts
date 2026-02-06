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

interface BuilderStore {
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedNodeId: string | null;
  dirty: boolean;
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
}

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  dirty: false,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as FlowNode[],
      dirty: true,
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges) as FlowEdge[],
      dirty: true,
    });
  },

  onConnect: (connection) => {
    const sourceNode = get().nodes.find((n) => n.id === connection.source);
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

    set({
      edges: [...get().edges, edge],
      dirty: true,
    });
  },

  addNode: (node) => {
    set({ nodes: [...get().nodes, node], dirty: true });
  },

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ) as FlowNode[],
      dirty: true,
    });
  },

  removeNode: (id) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
      dirty: true,
    });
  },

  selectNode: (id) => set({ selectedNodeId: id }),

  setDirty: (dirty) => set({ dirty }),

  reset: () =>
    set({ nodes: [], edges: [], selectedNodeId: null, dirty: false }),
}));
