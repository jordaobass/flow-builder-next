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

export function NodePalette() {
  const addNode = useBuilderStore((s) => s.addNode);
  const nodes = useBuilderStore((s) => s.nodes);
  const questions = useQuestionStore((s) => s.questions);
  const [selectedQuestionId, setSelectedQuestionId] = useState('');
  const [selectedResult, setSelectedResult] = useState<DecisionResult>('ALLOW');

  // Condition node form
  const [condField, setCondField] = useState('');
  const [condOperator, setCondOperator] = useState<ConditionOperator>('eq');
  const [condValue, setCondValue] = useState('');

  const getNextY = () => {
    if (nodes.length === 0) return 50;
    return Math.max(...nodes.map((n) => n.position.y)) + 140;
  };

  const addQuestionNode = () => {
    if (!selectedQuestionId) return;
    const node: FlowNode = {
      id: `question_${selectedQuestionId}_${Date.now()}`,
      type: 'question',
      position: { x: 300, y: getNextY() },
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

    const node: FlowNode = {
      id: `condition_${Date.now()}`,
      type: 'condition',
      position: { x: 300, y: getNextY() },
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
    const node: FlowNode = {
      id: `end_${Date.now()}`,
      type: 'end',
      position: { x: 300, y: getNextY() },
      data: {
        result: selectedResult,
        reason: `${selectedResult} decision.`,
        isDefault: false,
      },
    };
    addNode(node);
  };

  return (
    <div className="p-4 space-y-4 border-b">
      <h3 className="font-semibold text-sm">Add Nodes</h3>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Select value={selectedQuestionId} onValueChange={setSelectedQuestionId}>
            <SelectTrigger className="flex-1">
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
          <Button size="sm" onClick={addQuestionNode} disabled={!selectedQuestionId}>
            + Q
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-purple-600">Condition</Label>
        <Select value={condField} onValueChange={setCondField}>
          <SelectTrigger>
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
        <div className="flex gap-2">
          <Select value={condOperator} onValueChange={(v) => setCondOperator(v as ConditionOperator)}>
            <SelectTrigger className="w-20">
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
            className="flex-1"
            placeholder="Value..."
            value={condValue}
            onChange={(e) => setCondValue(e.target.value)}
          />
          <Button size="sm" onClick={addConditionNode} disabled={!condField}>
            + C
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Select value={selectedResult} onValueChange={(v) => setSelectedResult(v as DecisionResult)}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALLOW">ALLOW</SelectItem>
            <SelectItem value="BLOCK">BLOCK</SelectItem>
            <SelectItem value="REVIEW">REVIEW</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" onClick={addEndNode}>
          + End
        </Button>
      </div>
    </div>
  );
}
