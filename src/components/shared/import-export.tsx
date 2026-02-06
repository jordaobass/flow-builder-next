'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface ImportExportProps<T> {
  data: T[];
  onImport: (data: T[]) => void;
  label: string;
}

export function ImportExport<T>({ data, onImport, label }: ImportExportProps<T>) {
  const [open, setOpen] = useState(false);
  const [json, setJson] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'export' | 'import'>('export');

  const handleExport = () => {
    setMode('export');
    setJson(JSON.stringify(data, null, 2));
    setError('');
    setOpen(true);
  };

  const handleImportOpen = () => {
    setMode('import');
    setJson('');
    setError('');
    setOpen(true);
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) {
        setError('JSON must be an array.');
        return;
      }
      onImport(parsed as T[]);
      setOpen(false);
    } catch {
      setError('Invalid JSON format.');
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExport}>
        Export {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" onClick={handleImportOpen}>
            Import {label}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mode === 'export' ? `Export ${label}` : `Import ${label}`}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={json}
            onChange={(e) => {
              setJson(e.target.value);
              setError('');
            }}
            rows={12}
            readOnly={mode === 'export'}
            placeholder={mode === 'import' ? 'Paste JSON array here...' : ''}
            className="font-mono text-xs"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {mode === 'import' && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport}>Import</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
