'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StepRenderer } from './step-renderer';
import { useQuestionStore } from '@/stores/question-store';
import { Policy } from '@/types/policy';
import { Answers } from '@/types/engine';
import { EvaluationResult } from '@/types/engine';
import { evaluateDecision, getVisibleSteps } from '@/lib/policy-engine';

interface FlowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: Policy;
  onDone: (result: EvaluationResult) => void;
}

export function FlowModal({ open, onOpenChange, policy, onDone }: FlowModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const getQuestion = useQuestionStore((s) => s.getQuestion);

  const visibleSteps = useMemo(
    () => getVisibleSteps(policy.steps, answers),
    [policy.steps, answers]
  );

  const currentStepData = visibleSteps[currentStep];
  const question = currentStepData
    ? getQuestion(currentStepData.questionId)
    : null;

  const handleAnswer = (value: string | number | boolean) => {
    if (!currentStepData) return;
    setAnswers((prev) => ({
      ...prev,
      [currentStepData.questionId]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      // Evaluate
      const { result, reason } = evaluateDecision(policy, answers);
      onDone({
        result,
        reason,
        answers,
        policyId: policy.id,
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const currentAnswer = currentStepData
    ? answers[currentStepData.questionId]
    : undefined;

  const canProceed = currentAnswer !== undefined && currentAnswer !== '';

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setCurrentStep(0);
          setAnswers({});
        }
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{policy.name}</DialogTitle>
        </DialogHeader>

        <div className="text-xs text-muted-foreground mb-2">
          Step {currentStep + 1} of {visibleSteps.length}
        </div>

        <div className="w-full bg-muted rounded-full h-2 mb-4">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{
              width: `${((currentStep + 1) / visibleSteps.length) * 100}%`,
            }}
          />
        </div>

        {question ? (
          <StepRenderer
            question={question}
            value={currentAnswer}
            onChange={handleAnswer}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Question not found: {currentStepData?.questionId}
          </p>
        )}

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button onClick={handleNext} disabled={!canProceed}>
            {currentStep < visibleSteps.length - 1 ? 'Next' : 'Finish'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
