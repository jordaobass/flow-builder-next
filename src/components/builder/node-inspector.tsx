'use client';

import { useBuilderStore } from '@/stores/builder-store';
import { useQuestionStore } from '@/stores/question-store';
import { useParameterStore } from '@/stores/parameter-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterNodeData, QuestionNodeData, ConditionNodeData, EndNodeData } from '@/types/flow';
import { DecisionResult, ConditionOperator } from '@/types/policy';

export function NodeInspector() {
  const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
  const nodes = useBuilderStore((s) => s.nodes);
  const updateNodeData = useBuilderStore((s) => s.updateNodeData);
  const removeNode = useBuilderStore((s) => s.removeNode);
  const questions = useQuestionStore((s) => s.questions);
  const parameters = useParameterStore((s) => s.parameters);

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Select a node to inspect its properties.
      </div>
    );
  }

  if (node.type === 'filter') {
    const data = node.data as unknown as FilterNodeData;
    return (
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-sm">Filter Node</h3>
        {parameters.map((p) => (
          <div key={p.key} className="space-y-1">
            <Label className="text-xs">{p.name}</Label>
            <Input
              value={String(data.scope[p.key] ?? '')}
              onChange={(e) =>
                updateNodeData(node.id, {
                  scope: {
                    ...data.scope,
                    ...(e.target.value ? { [p.key]: e.target.value } : (() => { const s = { ...data.scope }; delete s[p.key]; return s; })()),
                  },
                })
              }
            />
          </div>
        ))}
      </div>
    );
  }

  if (node.type === 'question') {
    const data = node.data as unknown as QuestionNodeData;
    return (
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-sm">Question Node</h3>
        <div className="space-y-2">
          <Label>Question</Label>
          <Select
            value={data.questionId}
            onValueChange={(v) => updateNodeData(node.id, { questionId: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {questions.map((q) => (
                <SelectItem key={q.id} value={q.id}>
                  {q.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => removeNode(node.id)}
        >
          Remove Node
        </Button>
      </div>
    );
  }

  if (node.type === 'condition') {
    const data = node.data as unknown as ConditionNodeData;
    const questionId = data.field.replace(/^\$answers\./, '');
    const selectedQuestion = questions.find((q) => q.id === questionId);

    return (
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-sm text-purple-600">Condition Node</h3>
        <div className="space-y-2">
          <Label>Field (Question)</Label>
          <Select
            value={questionId}
            onValueChange={(v) => updateNodeData(node.id, { field: `$answers.${v}` })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {questions.map((q) => (
                <SelectItem key={q.id} value={q.id}>
                  {q.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Operator</Label>
          <Select
            value={data.operator}
            onValueChange={(v) => updateNodeData(node.id, { operator: v as ConditionOperator })}
          >
            <SelectTrigger>
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
        </div>
        <div className="space-y-2">
          <Label>Value</Label>
          {selectedQuestion?.type === 'boolean' ? (
            <Select
              value={String(data.value)}
              onValueChange={(v) => updateNodeData(node.id, { value: v === 'true' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">true</SelectItem>
                <SelectItem value="false">false</SelectItem>
              </SelectContent>
            </Select>
          ) : selectedQuestion?.type === 'select' && selectedQuestion.options ? (
            <Select
              value={String(data.value)}
              onValueChange={(v) => updateNodeData(node.id, { value: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {selectedQuestion.options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={String(data.value)}
              onChange={(e) => {
                let val: string | number | boolean = e.target.value;
                if (val === 'true') val = true;
                else if (val === 'false') val = false;
                else if (!isNaN(Number(val)) && val.trim() !== '') val = Number(val);
                updateNodeData(node.id, { value: val });
              }}
            />
          )}
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => removeNode(node.id)}
        >
          Remove Node
        </Button>
      </div>
    );
  }

  if (node.type === 'end') {
    const data = node.data as unknown as EndNodeData;
    return (
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-sm">End Node</h3>
        <div className="space-y-2">
          <Label>Result</Label>
          <Select
            value={data.result}
            onValueChange={(v) =>
              updateNodeData(node.id, { result: v as DecisionResult })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALLOW">ALLOW</SelectItem>
              <SelectItem value="BLOCK">BLOCK</SelectItem>
              <SelectItem value="REVIEW">REVIEW</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Reason</Label>
          <Textarea
            value={data.reason}
            onChange={(e) => updateNodeData(node.id, { reason: e.target.value })}
            rows={3}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isDefault"
            checked={data.isDefault ?? false}
            onChange={(e) =>
              updateNodeData(node.id, { isDefault: e.target.checked })
            }
          />
          <Label htmlFor="isDefault">Default end node</Label>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => removeNode(node.id)}
        >
          Remove Node
        </Button>
      </div>
    );
  }

  return null;
}
