'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Question } from '@/types/question';

interface StepRendererProps {
  question: Question;
  value: string | number | boolean | undefined;
  onChange: (value: string | number | boolean) => void;
}

export function StepRenderer({ question, value, onChange }: StepRendererProps) {
  switch (question.type) {
    case 'boolean':
      return (
        <div className="space-y-3">
          <Label className="text-base">{question.label}</Label>
          <div className="flex gap-3">
            <Button
              variant={value === true ? 'default' : 'outline'}
              onClick={() => onChange(true)}
              className="flex-1"
            >
              Yes
            </Button>
            <Button
              variant={value === false ? 'default' : 'outline'}
              onClick={() => onChange(false)}
              className="flex-1"
            >
              No
            </Button>
          </div>
        </div>
      );

    case 'select':
      return (
        <div className="space-y-3">
          <Label className="text-base">{question.label}</Label>
          <Select
            value={value as string | undefined}
            onValueChange={(v) => onChange(v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case 'number':
      return (
        <div className="space-y-3">
          <Label className="text-base">{question.label}</Label>
          <Input
            type="number"
            value={value as number ?? ''}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </div>
      );

    case 'text':
      return (
        <div className="space-y-3">
          <Label className="text-base">{question.label}</Label>
          <Input
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    default:
      return <p>Unknown question type</p>;
  }
}
