'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EvaluationResult } from '@/types/engine';
import { DECISION_BADGE_VARIANTS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface ResultDisplayProps {
  result: EvaluationResult;
  onReset: () => void;
}

export function ResultDisplay({ result, onReset }: ResultDisplayProps) {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          Result
          <Badge
            className={cn(
              'text-sm px-3 py-1',
              DECISION_BADGE_VARIANTS[result.result]
            )}
          >
            {result.result}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Reason</p>
          <p className="text-sm text-muted-foreground">{result.reason}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Policy ID</p>
          <p className="text-sm text-muted-foreground font-mono">
            {result.policyId}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Answers</p>
          <div className="space-y-1">
            {Object.entries(result.answers).map(([key, val]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="font-mono text-muted-foreground">{key}</span>
                <span className="font-medium">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onReset} variant="outline" className="flex-1 gap-1.5">
            <ArrowLeft className="size-3.5" />
            Back to Demos
          </Button>
          <Button onClick={onReset} className="flex-1 gap-1.5">
            <RotateCcw className="size-3.5" />
            Run Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
