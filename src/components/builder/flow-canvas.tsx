'use client';

import { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useBuilderStore } from '@/stores/builder-store';
import { useQuestionStore } from '@/stores/question-store';
import { usePolicyStore } from '@/stores/policy-store';
import { policyToFlow, flowToPolicy } from '@/lib/flow-converter';
import { FilterNodeComponent } from './nodes/filter-node';
import { QuestionNodeComponent } from './nodes/question-node';
import { ConditionNodeComponent } from './nodes/condition-node';
import { EndNodeComponent } from './nodes/end-node';
import { NodePalette } from './node-palette';
import { NodeInspector } from './node-inspector';
import { Button } from '@/components/ui/button';
import { FlowNode, FlowEdge } from '@/types/flow';
import { useParameterStore } from '@/stores/parameter-store';

const nodeTypes: NodeTypes = {
  filter: FilterNodeComponent,
  question: QuestionNodeComponent,
  condition: ConditionNodeComponent,
  end: EndNodeComponent,
};

// Valid connections: Filter→Question/Condition, Question→Question/Condition/End, Condition→Condition/End, End→nothing
const ALLOWED_TARGETS: Record<string, string[]> = {
  filter: ['question', 'condition'],
  question: ['question', 'condition', 'end'],
  condition: ['condition', 'end'],
};

interface FlowCanvasProps {
  policyId: string;
}

export function FlowCanvas({ policyId }: FlowCanvasProps) {
  const {
    nodes,
    edges,
    dirty,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectNode,
    setDirty,
  } = useBuilderStore();

  const { hydrate: hydrateQuestions, hydrated: questionsHydrated } =
    useQuestionStore();
  const {
    hydrate: hydratePolicies,
    hydrated: policiesHydrated,
    getPolicy,
    updatePolicy,
  } = usePolicyStore();
  const { hydrate: hydrateParams } = useParameterStore();

  useEffect(() => {
    hydrateQuestions();
    hydratePolicies();
    hydrateParams();
  }, [hydrateQuestions, hydratePolicies, hydrateParams]);

  useEffect(() => {
    if (!policiesHydrated) return;
    const policy = getPolicy(policyId);
    if (policy) {
      const { nodes: flowNodes, edges: flowEdges } = policyToFlow(policy);
      setNodes(flowNodes);
      setEdges(flowEdges);
      setDirty(false);
    }
  }, [policyId, policiesHydrated, getPolicy, setNodes, setEdges, setDirty]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: FlowNode) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  const handlePaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const handleSave = useCallback(() => {
    const policy = getPolicy(policyId);
    if (!policy) return;
    const updated = flowToPolicy(nodes, edges, policy);
    updatePolicy(policyId, updated);
    setDirty(false);
  }, [policyId, nodes, edges, getPolicy, updatePolicy, setDirty]);

  const isValidConnection = useCallback(
    (connection: Connection | FlowEdge) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);
      if (!sourceNode || !targetNode) return false;

      const sourceType = sourceNode.type ?? '';
      const targetType = targetNode.type ?? '';
      const allowed = ALLOWED_TARGETS[sourceType];
      if (!allowed) return false;
      return allowed.includes(targetType);
    },
    [nodes]
  );

  const miniMapNodeColor = useMemo(
    () => (node: FlowNode) => {
      switch (node.type) {
        case 'filter':
          return '#60a5fa';
        case 'question':
          return '#e5e7eb';
        case 'condition':
          return '#c084fc';
        case 'end':
          return '#34d399';
        default:
          return '#e5e7eb';
      }
    },
    []
  );

  if (!questionsHydrated || !policiesHydrated) return null;

  const policy = getPolicy(policyId);
  if (!policy) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Policy not found: {policyId}</p>
      </div>
    );
  }

  const scopeEntries = Object.entries(policy.scope).filter(([, v]) => v !== '' && v !== undefined);
  const scopeSummary = scopeEntries.map(([, v]) => String(v)).join(' / ');

  return (
    <div className="flex h-full">
      <div className="w-64 border-r bg-muted/20 flex flex-col overflow-y-auto">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm truncate">{policy.name}</h3>
          <p className="text-xs text-muted-foreground">
            {scopeSummary || 'No scope'}
          </p>
        </div>
        <NodePalette />
        <div className="flex-1 overflow-y-auto border-t">
          <NodeInspector />
        </div>
        <div className="p-4 border-t">
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={!dirty}
          >
            {dirty ? 'Save Changes' : 'Saved'}
          </Button>
        </div>
      </div>
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          isValidConnection={isValidConnection}
          fitView
          className="bg-gray-50"
          defaultEdgeOptions={{
            style: { strokeWidth: 1.5 },
          }}
        >
          <Background />
          <Controls />
          <MiniMap nodeColor={miniMapNodeColor} />
        </ReactFlow>
      </div>
    </div>
  );
}
