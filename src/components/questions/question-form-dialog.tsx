'use client';

import { useState, useId } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Question, QuestionType } from '@/types/question';

interface QuestionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: Question | null;
  onSave: (question: Question) => void;
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'boolean', label: 'Boolean (Yes/No)' },
  { value: 'select', label: 'Select (Dropdown)' },
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
];

export function QuestionFormDialog({
  open,
  onOpenChange,
  question,
  onSave,
}: QuestionFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <QuestionFormContent
          key={question?.id ?? '__new__'}
          question={question}
          onSave={onSave}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

function QuestionFormContent({
  question,
  onSave,
  onOpenChange,
}: {
  question?: Question | null;
  onSave: (question: Question) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const reactId = useId();
  const [id, setId] = useState(question?.id ?? `q${reactId.replace(/:/g, '_')}`);
  const [label, setLabel] = useState(question?.label ?? '');
  const [type, setType] = useState<QuestionType>(question?.type ?? 'boolean');
  const [options, setOptions] = useState(question?.options?.join(', ') ?? '');

  const isEditing = !!question;

  const handleSave = () => {
    const q: Question = {
      id: id.trim(),
      label: label.trim(),
      type,
    };
    if (type === 'select' && options.trim()) {
      q.options = options.split(',').map((o) => o.trim()).filter(Boolean);
    }
    onSave(q);
    onOpenChange(false);
  };

  const isValid = id.trim() && label.trim();

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? 'Edit Question' : 'New Question'}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="q-id">ID</Label>
          <Input
            id="q-id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            disabled={isEditing}
            placeholder="q_my_question"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="q-label">Label</Label>
          <Input
            id="q-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="What is your question?"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="q-type">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as QuestionType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUESTION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {type === 'select' && (
          <div className="space-y-2">
            <Label htmlFor="q-options">Options (comma-separated)</Label>
            <Input
              id="q-options"
              value={options}
              onChange={(e) => setOptions(e.target.value)}
              placeholder="Option A, Option B, Option C"
            />
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </>
  );
}
