'use client';

import { Button } from '@/components/ui/button';
import { useBuilderStore } from '@/stores/builder-store';
import { useQuestionStore } from '@/stores/question-store';
import { FlowNode } from '@/types/flow';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { DecisionResult, ConditionOperator } from '@/types/policy';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircleQuestion, GitFork, CircleStop } from 'lucide-react';

export function NodePalette() {
  const addNode = useBuilderStore((s) => s.addNode);
  const nodes = useBuilderStore((s) => s.nodes);
  const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
  const questions = useQuestionStore((s) => s.questions);
  const [selectedQuestionId, setSelectedQuestionId] = useState('');
  const [selectedResult, setSelectedResult] = useState<DecisionResult>('ALLOW');

  // Condition node form
  const [condField, setCondField] = useState('');
  const [condOperator, setCondOperator] = useState<ConditionOperator>('eq');
  const [condValue, setCondValue] = useState('');

  const getSmartPosition = () => {
    const selected = nodes.find((n) => n.id === selectedNodeId);
    if (selected) {
      return { x: selected.position.x, y: selected.position.y + 140 };
    }
    if (nodes.length === 0) return { x: 300, y: 50 };
    const maxY = Math.max(...nodes.map((n) => n.position.y));
    return { x: 300, y: maxY + 140 };
  };

  const addQuestionNode = () => {
    if (!selectedQuestionId) return;
    const pos = getSmartPosition();
    const node: FlowNode = {
      id: `question_${selectedQuestionId}_${Date.now()}`,
      type: 'question',
      position: pos,
      data: { questionId: selectedQuestionId },
    };
    addNode(node);
    setSelectedQuestionId('');
  };

  const addConditionNode = () => {
    if (!condField) return;
    let parsedValue: string | number | boolean = condValue;
    if (condValue === 'true') parsedValue = true;
    else if (condValue === 'false') parsedValue = false;
    else if (!isNaN(Number(condValue)) && condValue.trim() !== '') parsedValue = Number(condValue);

    const pos = getSmartPosition();
    const node: FlowNode = {
      id: `condition_${Date.now()}`,
      type: 'condition',
      position: pos,
      data: {
        field: `$answers.${condField}`,
        operator: condOperator,
        value: parsedValue,
      },
    };
    addNode(node);
    setCondValue('');
  };

  const addEndNode = () => {
    const pos = getSmartPosition();
    const node: FlowNode = {
      id: `end_${Date.now()}`,
      type: 'end',
      position: pos,
      data: {
        result: selectedResult,
        reason: `${selectedResult} decision.`,
        isDefault: false,
      },
    };
    addNode(node);
  };

  return (
    <div className="p-3 space-y-2 border-b overflow-hidden">
      <h3 className="font-semibold text-sm">Add Nodes</h3>

      {/* Question Node */}
      <div className="rounded-md border bg-muted/30 p-2 space-y-2">
        <div className="flex items-center gap-1.5">
          <MessageCircleQuestion className="size-3.5 text-gray-500 shrink-0" />
          <Label className="text-xs font-medium text-gray-600">Question</Label>
        </div>
        <Select value={selectedQuestionId} onValueChange={setSelectedQuestionId}>
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Select question..." />
          </SelectTrigger>
          <SelectContent>
            {questions.map((q) => (
              <SelectItem key={q.id} value={q.id}>
                {q.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" className="w-full" onClick={addQuestionNode} disabled={!selectedQuestionId}>
          + Add
        </Button>
      </div>

      {/* Condition Node */}
      <div className="rounded-md border border-purple-200 bg-purple-50/30 p-2 space-y-2">
        <div className="flex items-center gap-1.5">
          <GitFork className="size-3.5 text-purple-500 shrink-0" />
          <Label className="text-xs font-medium text-purple-600">Condition</Label>
        </div>
        <Select value={condField} onValueChange={setCondField}>
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Field (question)..." />
          </SelectTrigger>
          <SelectContent>
            {questions.map((q) => (
              <SelectItem key={q.id} value={q.id}>
                {q.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1.5 min-w-0">
          <Select value={condOperator} onValueChange={(v) => setCondOperator(v as ConditionOperator)}>
            <SelectTrigger className="w-16 shrink-0 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eq">=</SelectItem>
              <SelectItem value="neq">!=</SelectItem>
              <SelectItem value="gt">&gt;</SelectItem>
              <SelectItem value="lt">&lt;</SelectItem>
              <SelectItem value="gte">&gt;=</SelectItem>
              <SelectItem value="lte">&lt;=</SelectItem>
              <SelectItem value="contains">contains</SelectItem>
            </SelectContent>
          </Select>
          <Input
            className="flex-1 min-w-0 bg-background"
            placeholder="Value..."
            value={condValue}
            onChange={(e) => setCondValue(e.target.value)}
          />
        </div>
        <Button size="sm" className="w-full" onClick={addConditionNode} disabled={!condField}>
          + Add
        </Button>
      </div>

      {/* End Node */}
      <div className="rounded-md border border-green-200 bg-green-50/30 p-2 space-y-2">
        <div className="flex items-center gap-1.5">
          <CircleStop className="size-3.5 text-green-500 shrink-0" />
          <Label className="text-xs font-medium text-green-700">End Node</Label>
        </div>
        <Select value={selectedResult} onValueChange={(v) => setSelectedResult(v as DecisionResult)}>
          <SelectTrigger className="w-full bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALLOW">ALLOW</SelectItem>
            <SelectItem value="BLOCK">BLOCK</SelectItem>
            <SelectItem value="REVIEW">REVIEW</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="w-full" onClick={addEndNode}>
          + Add
        </Button>
      </div>
    </div>
  );
}
