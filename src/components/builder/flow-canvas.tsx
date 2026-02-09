'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  Connection,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toast } from 'sonner';

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
import {
  PanelLeftClose,
  PanelLeftOpen,
  Undo2,
  Redo2,
  Trash2,
  Copy,
  ClipboardPaste,
  Scissors,
  MousePointer2,
  Save,
  MessageCircleQuestion,
  GitFork,
  CircleStop,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const nodeTypes: NodeTypes = {
  filter: FilterNodeComponent,
  question: QuestionNodeComponent,
  condition: ConditionNodeComponent,
  end: EndNodeComponent,
};

const ALLOWED_TARGETS: Record<string, string[]> = {
  filter: ['question', 'condition'],
  question: ['question', 'condition', 'end'],
  condition: ['condition', 'end'],
};

interface ContextMenuState {
  x: number;
  y: number;
  nodeId?: string;
  edgeId?: string;
  flowPosition?: { x: number; y: number };
}

interface FlowCanvasProps {
  policyId: string;
}

function FlowCanvasInner({ policyId }: FlowCanvasProps) {
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
    selectedNodeId,
    undo,
    redo,
    canUndo,
    canRedo,
    addNode,
    removeNode,
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
  const { screenToFlowPosition } = useReactFlow();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [clipboard, setClipboard] = useState<FlowNode | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => setContextMenu(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [contextMenu]);

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
    toast.success('Policy saved successfully');
  }, [policyId, nodes, edges, getPolicy, updatePolicy, setDirty]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        setContextMenu(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, handleSave]);

  // Context menu handlers
  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: FlowNode) => {
      event.preventDefault();
      selectNode(node.id);
      const flowPos = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
        flowPosition: flowPos,
      });
    },
    [selectNode, screenToFlowPosition]
  );

  const handleEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: FlowEdge) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        edgeId: edge.id,
      });
    },
    []
  );

  const handlePaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      event.preventDefault();
      const flowPos = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        flowPosition: flowPos,
      });
    },
    [screenToFlowPosition]
  );

  const handleCopyNode = useCallback(() => {
    if (!contextMenu?.nodeId) return;
    const node = nodes.find((n) => n.id === contextMenu.nodeId);
    if (node) setClipboard(node);
    setContextMenu(null);
    toast.success('Node copied');
  }, [contextMenu, nodes]);

  const handleCutNode = useCallback(() => {
    if (!contextMenu?.nodeId) return;
    const node = nodes.find((n) => n.id === contextMenu.nodeId);
    if (node) {
      setClipboard(node);
      removeNode(node.id);
    }
    setContextMenu(null);
    toast.success('Node cut');
  }, [contextMenu, nodes, removeNode]);

  const handlePasteNode = useCallback(
    (position?: { x: number; y: number }) => {
      if (!clipboard) return;
      const pos = position ?? { x: clipboard.position.x + 50, y: clipboard.position.y + 50 };
      const newNode = {
        ...clipboard,
        id: `${clipboard.type}_${Date.now()}`,
        position: pos,
        data: { ...clipboard.data },
      } as FlowNode;
      addNode(newNode);
      setContextMenu(null);
      toast.success('Node pasted');
    },
    [clipboard, addNode]
  );

  const handleDeleteNode = useCallback(() => {
    if (!contextMenu?.nodeId) return;
    removeNode(contextMenu.nodeId);
    setContextMenu(null);
  }, [contextMenu, removeNode]);

  const handleDeleteEdge = useCallback(() => {
    if (!contextMenu?.edgeId) return;
    const newEdges = edges.filter((e) => e.id !== contextMenu.edgeId);
    setEdges(newEdges);
    setDirty(true);
    setContextMenu(null);
  }, [contextMenu, edges, setEdges, setDirty]);

  const handleAddNodeAtPosition = useCallback(
    (type: 'question' | 'condition' | 'end') => {
      const pos = contextMenu?.flowPosition ?? { x: 300, y: 100 };
      let node: FlowNode;
      if (type === 'question') {
        node = {
          id: `question_new_${Date.now()}`,
          type: 'question',
          position: pos,
          data: { questionId: '' },
        };
      } else if (type === 'condition') {
        node = {
          id: `condition_${Date.now()}`,
          type: 'condition',
          position: pos,
          data: { field: '$answers.', operator: 'eq', value: '' },
        };
      } else {
        node = {
          id: `end_${Date.now()}`,
          type: 'end',
          position: pos,
          data: { result: 'ALLOW', reason: 'ALLOW decision.', isDefault: false },
        };
      }
      addNode(node);
      selectNode(node.id);
      setContextMenu(null);
    },
    [contextMenu, addNode, selectNode]
  );

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
        case 'filter': return '#60a5fa';
        case 'question': return '#e5e7eb';
        case 'condition': return '#c084fc';
        case 'end': return '#34d399';
        default: return '#e5e7eb';
      }
    },
    []
  );

  const styledNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        className: n.id === selectedNodeId ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg' : '',
      })),
    [nodes, selectedNodeId]
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

  const contextNode = contextMenu?.nodeId ? nodes.find((n) => n.id === contextMenu.nodeId) : null;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full">
        {sidebarOpen && (
          <div className="w-64 min-w-64 max-w-64 border-r bg-muted/20 flex flex-col overflow-y-auto overflow-x-hidden">
            <div className="p-4 border-b flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">{policy.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {scopeSummary || 'No scope'}
                </p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => setSidebarOpen(false)}>
                    <PanelLeftClose className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Collapse sidebar</TooltipContent>
              </Tooltip>
            </div>
            <NodePalette />
            <div className="flex-1 overflow-y-auto overflow-x-hidden border-t">
              <NodeInspector />
            </div>
            <div className="p-4 border-t space-y-2">
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={undo} disabled={!canUndo()}>
                      <Undo2 className="size-3.5" />
                      Undo
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Ctrl+Z</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={redo} disabled={!canRedo()}>
                      <Redo2 className="size-3.5" />
                      Redo
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Ctrl+Shift+Z</TooltipContent>
                </Tooltip>
              </div>
              <Button className="w-full" onClick={handleSave} disabled={!dirty}>
                {dirty ? 'Save Changes' : 'Saved'}
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 relative">
          {!sidebarOpen && (
            <div className="absolute top-3 left-3 z-10">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="size-8 bg-background shadow-sm" onClick={() => setSidebarOpen(true)}>
                    <PanelLeftOpen className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Expand sidebar</TooltipContent>
              </Tooltip>
            </div>
          )}
          {dirty && (
            <div className="absolute top-3 right-3 z-10">
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved changes
              </div>
            </div>
          )}
          <ReactFlow
            nodes={styledNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            onNodeContextMenu={handleNodeContextMenu}
            onEdgeContextMenu={handleEdgeContextMenu}
            onPaneContextMenu={handlePaneContextMenu}
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

          {/* Context Menu */}
          {contextMenu && (
            <div
              ref={menuRef}
              className="fixed z-50 min-w-[180px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
              style={{ top: contextMenu.y, left: contextMenu.x }}
            >
              {contextMenu.nodeId && contextNode ? (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {contextNode.type?.toUpperCase()} Node
                  </div>
                  <div className="h-px bg-border my-1" />
                  <ContextMenuItem icon={<MousePointer2 className="size-3.5" />} label="Select" shortcut="" onClick={() => { selectNode(contextMenu.nodeId!); setContextMenu(null); }} />
                  <ContextMenuItem icon={<Copy className="size-3.5" />} label="Copy" shortcut="Ctrl+C" onClick={handleCopyNode} />
                  <ContextMenuItem icon={<Scissors className="size-3.5" />} label="Cut" shortcut="Ctrl+X" onClick={handleCutNode} />
                  {contextNode.type !== 'filter' && (
                    <>
                      <div className="h-px bg-border my-1" />
                      <ContextMenuItem icon={<Trash2 className="size-3.5 text-red-500" />} label="Delete" shortcut="Del" onClick={handleDeleteNode} variant="destructive" />
                    </>
                  )}
                </>
              ) : contextMenu.edgeId ? (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Edge
                  </div>
                  <div className="h-px bg-border my-1" />
                  <ContextMenuItem icon={<Trash2 className="size-3.5 text-red-500" />} label="Delete edge" shortcut="" onClick={handleDeleteEdge} variant="destructive" />
                </>
              ) : (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Canvas
                  </div>
                  <div className="h-px bg-border my-1" />
                  <ContextMenuItem icon={<MessageCircleQuestion className="size-3.5 text-gray-500" />} label="Add Question" onClick={() => handleAddNodeAtPosition('question')} />
                  <ContextMenuItem icon={<GitFork className="size-3.5 text-purple-500" />} label="Add Condition" onClick={() => handleAddNodeAtPosition('condition')} />
                  <ContextMenuItem icon={<CircleStop className="size-3.5 text-green-500" />} label="Add End Node" onClick={() => handleAddNodeAtPosition('end')} />
                  {clipboard && (
                    <>
                      <div className="h-px bg-border my-1" />
                      <ContextMenuItem icon={<ClipboardPaste className="size-3.5" />} label="Paste" shortcut="Ctrl+V" onClick={() => handlePasteNode(contextMenu.flowPosition)} />
                    </>
                  )}
                  <div className="h-px bg-border my-1" />
                  <ContextMenuItem icon={<Undo2 className="size-3.5" />} label="Undo" shortcut="Ctrl+Z" onClick={() => { undo(); setContextMenu(null); }} disabled={!canUndo()} />
                  <ContextMenuItem icon={<Redo2 className="size-3.5" />} label="Redo" shortcut="Ctrl+Shift+Z" onClick={() => { redo(); setContextMenu(null); }} disabled={!canRedo()} />
                  <div className="h-px bg-border my-1" />
                  <ContextMenuItem icon={<Save className="size-3.5" />} label="Save" shortcut="Ctrl+S" onClick={() => { handleSave(); setContextMenu(null); }} disabled={!dirty} />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

function ContextMenuItem({
  icon,
  label,
  shortcut,
  onClick,
  variant,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  variant?: 'destructive';
  disabled?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-accent hover:text-accent-foreground'}
        ${variant === 'destructive' && !disabled ? 'text-red-600 hover:bg-red-50 hover:text-red-700' : ''}
      `}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {shortcut && (
        <span className="ml-auto text-xs text-muted-foreground">{shortcut}</span>
      )}
    </button>
  );
}

export function FlowCanvas({ policyId }: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner policyId={policyId} />
    </ReactFlowProvider>
  );
}
