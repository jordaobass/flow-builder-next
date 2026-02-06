'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useParameterStore } from '@/stores/parameter-store';
import { ParameterTable } from '@/components/parameters/parameter-table';
import { ParameterFormDialog } from '@/components/parameters/parameter-form-dialog';
import { ImportExport } from '@/components/shared/import-export';
import { EmptyState } from '@/components/shared/empty-state';
import { Parameter } from '@/types/parameter';

export default function ParametersPage() {
  const { parameters, hydrated, hydrate, addParameter, updateParameter, deleteParameter, setParameters } =
    useParameterStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Parameter | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleSave = (p: Parameter) => {
    if (editing) {
      updateParameter(p.id, p);
    } else {
      addParameter(p);
    }
    setEditing(null);
  };

  const handleEdit = (p: Parameter) => {
    setEditing(p);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  if (!hydrated) return null;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700">Step 1</span>
            <h2 className="text-2xl font-bold">Parameters</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Define the scope fields that determine which policy applies.
            These are the filters like <strong>country</strong>, <strong>state</strong>, <strong>companyId</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ImportExport
            data={parameters}
            onImport={setParameters}
            label="JSON"
          />
          <Button onClick={handleNew}>+ New Parameter</Button>
        </div>
      </div>

      {parameters.length === 0 ? (
        <EmptyState
          title="No parameters yet"
          description="Create your first parameter to define policy scopes."
          action={<Button onClick={handleNew}>+ New Parameter</Button>}
        />
      ) : (
        <>
          <ParameterTable
            parameters={parameters}
            onEdit={handleEdit}
            onDelete={deleteParameter}
          />
          <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
            Next step:
            <Button variant="outline" size="sm" asChild>
              <Link href="/questions">2. Questions &rarr;</Link>
            </Button>
          </div>
        </>
      )}

      <ParameterFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        parameter={editing}
        onSave={handleSave}
      />
    </div>
  );
}
