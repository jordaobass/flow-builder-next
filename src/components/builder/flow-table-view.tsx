'use client';

import { Policy } from '@/types/policy';
import { useQuestionStore } from '@/stores/question-store';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DECISION_BADGE_VARIANTS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface FlowTableViewProps {
  policy: Policy;
}

const OPERATOR_LABELS: Record<string, string> = {
  eq: '=',
  neq: '!=',
  gt: '>',
  lt: '<',
  gte: '>=',
  lte: '<=',
  contains: 'contains',
};

export function FlowTableView({ policy }: FlowTableViewProps) {
  const questions = useQuestionStore((s) => s.questions);
  const getQuestion = useQuestionStore((s) => s.getQuestion);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Scope Section */}
      <section>
        <h3 className="text-sm font-semibold mb-2 text-blue-600">Scope (Filter)</h3>
        <div className="border rounded-lg p-4 bg-blue-50/50">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(policy.scope).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <span className="text-muted-foreground font-medium">{key}:</span>
                <span>{String(value)}</span>
              </div>
            ))}
            {Object.keys(policy.scope).length === 0 && (
              <span className="text-muted-foreground italic">No scope defined</span>
            )}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section>
        <h3 className="text-sm font-semibold mb-2">Steps ({policy.steps.length})</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Question</TableHead>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead>Show When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policy.steps.map((step, idx) => {
              const q = getQuestion(step.questionId);
              return (
                <TableRow key={step.questionId}>
                  <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-medium">
                    {q?.label ?? step.questionId}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {q?.type ?? 'unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {step.showWhen ? (
                      <span className="text-orange-600">
                        {getQuestion(step.showWhen.questionId)?.label ?? step.showWhen.questionId}{' '}
                        {OPERATOR_LABELS[step.showWhen.operator] ?? step.showWhen.operator}{' '}
                        {String(step.showWhen.value)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {policy.steps.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No steps defined
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      {/* Rules Section */}
      <section>
        <h3 className="text-sm font-semibold mb-2 text-purple-600">
          Decision Rules ({policy.decision.rules.length})
        </h3>
        <div className="space-y-3">
          {policy.decision.rules.map((rule, idx) => (
            <div key={idx} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Rule {idx + 1}
                </span>
                <Badge
                  className={cn(
                    'text-xs border',
                    DECISION_BADGE_VARIANTS[rule.result] ?? ''
                  )}
                >
                  {rule.result}
                </Badge>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">When </span>
                <Badge variant="outline" className="text-xs">
                  {rule.when.logic}
                </Badge>
                <span className="text-muted-foreground"> of:</span>
              </div>
              <ul className="text-sm space-y-1 ml-4">
                {rule.when.conditions.map((cond, ci) => {
                  const questionId = cond.field.replace(/^\$answers\./, '');
                  const q = questions.find((q) => q.id === questionId);
                  return (
                    <li key={ci} className="flex gap-1 items-center">
                      <span className="font-medium">
                        {q?.label ?? questionId}
                      </span>
                      <span className="text-muted-foreground">
                        {OPERATOR_LABELS[cond.operator] ?? cond.operator}
                      </span>
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                        {String(cond.value)}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="text-sm text-muted-foreground">
                Reason: {rule.reason}
              </div>
            </div>
          ))}

          {/* Default */}
          <div className="border rounded-lg p-4 border-dashed">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Default
              </span>
              <Badge
                className={cn(
                  'text-xs border',
                  DECISION_BADGE_VARIANTS[policy.decision.defaultResult] ?? ''
                )}
              >
                {policy.decision.defaultResult}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {policy.decision.defaultReason}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
