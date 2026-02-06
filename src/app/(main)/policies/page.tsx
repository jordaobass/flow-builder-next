'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePolicyStore } from '@/stores/policy-store';
import { useParameterStore } from '@/stores/parameter-store';
import { PolicyTable } from '@/components/policies/policy-table';
import { PolicyFormDialog } from '@/components/policies/policy-form-dialog';
import { ImportExport } from '@/components/shared/import-export';
import { EmptyState } from '@/components/shared/empty-state';
import { Policy } from '@/types/policy';

export default function PoliciesPage() {
  const {
    policies,
    hydrated,
    hydrate,
    addPolicy,
    updatePolicy,
    deletePolicy,
    duplicatePolicy,
    setPolicies,
  } = usePolicyStore();
  const { hydrate: hydrateParams } = useParameterStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Policy | null>(null);

  useEffect(() => {
    hydrate();
    hydrateParams();
  }, [hydrate, hydrateParams]);

  const handleSave = (p: Policy) => {
    if (editing) {
      updatePolicy(p.id, p);
    } else {
      addPolicy(p);
    }
    setEditing(null);
  };

  const handleEdit = (p: Policy) => {
    setEditing(p);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleDuplicate = (id: string, scopeOverrides: Record<string, string>) => {
    duplicatePolicy(id, scopeOverrides);
  };

  if (!hydrated) return null;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-700">Step 3</span>
            <h2 className="text-2xl font-bold">Policies</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Each policy has a <strong>scope</strong> (filter), <strong>steps</strong> (questions), and <strong>decision rules</strong> (conditions).
            Click <strong>&quot;Builder&quot;</strong> to open the visual flow editor.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ImportExport
            data={policies}
            onImport={setPolicies}
            label="JSON"
          />
          <Button onClick={handleNew}>+ New Policy</Button>
        </div>
      </div>

      {/* Tip */}
      <div className="text-xs text-muted-foreground bg-muted/50 rounded-md px-4 py-2 border border-dashed">
        <strong>Tip:</strong> After creating a policy, click the <strong>&quot;Builder&quot;</strong> button in the table to visually design
        the decision flow. Use <strong>&quot;Duplicate&quot;</strong> to create a copy with different scope values (e.g., a different country).
      </div>

      {policies.length === 0 ? (
        <EmptyState
          title="No policies yet"
          description="Create your first policy to start defining compliance rules."
          action={<Button onClick={handleNew}>+ New Policy</Button>}
        />
      ) : (
        <>
          <PolicyTable
            policies={policies}
            onEdit={handleEdit}
            onDelete={deletePolicy}
            onDuplicate={handleDuplicate}
          />
          <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
            Next step:
            <Button variant="outline" size="sm" asChild>
              <Link href="/demo">4. Demo &rarr;</Link>
            </Button>
          </div>
        </>
      )}

      <PolicyFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        policy={editing}
        onSave={handleSave}
      />
    </div>
  );
}
