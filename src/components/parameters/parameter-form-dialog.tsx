'use client';

import { useState } from 'react';
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
import { Parameter, ParameterType } from '@/types/parameter';

interface ParameterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parameter?: Parameter | null;
  onSave: (parameter: Parameter) => void;
}

export function ParameterFormDialog({
  open,
  onOpenChange,
  parameter,
  onSave,
}: ParameterFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <ParameterFormContent
          key={parameter?.id ?? '__new__'}
          parameter={parameter}
          onSave={onSave}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

function ParameterFormContent({
  parameter,
  onSave,
  onOpenChange,
}: {
  parameter?: Parameter | null;
  onSave: (parameter: Parameter) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState(parameter?.name ?? '');
  const [key, setKey] = useState(parameter?.key ?? '');
  const [type, setType] = useState<ParameterType>(parameter?.type ?? 'string');
  const [optionsText, setOptionsText] = useState(parameter?.options?.join(', ') ?? '');
  const [category, setCategory] = useState(parameter?.category ?? '');

  const isEditing = !!parameter;

  const handleSave = () => {
    const p: Parameter = {
      id: parameter?.id ?? `param_${Date.now()}`,
      name: name.trim(),
      key: key.trim(),
      type,
      ...(type === 'select' && optionsText.trim()
        ? { options: optionsText.split(',').map((o) => o.trim()).filter(Boolean) }
        : {}),
      ...(category.trim() ? { category: category.trim() } : {}),
    };
    onSave(p);
    onOpenChange(false);
  };

  const isValid = name.trim() && key.trim();

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? 'Edit Parameter' : 'New Parameter'}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Country" />
          </div>
          <div className="space-y-2">
            <Label>Key</Label>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="country"
              disabled={isEditing}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as ParameterType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="select">Select</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="geo" />
          </div>
        </div>
        {type === 'select' && (
          <div className="space-y-2">
            <Label>Options (comma-separated)</Label>
            <Input
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              placeholder="opt1, opt2, opt3"
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
