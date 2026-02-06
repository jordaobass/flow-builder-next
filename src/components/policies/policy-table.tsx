'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Policy } from '@/types/policy';
import { DuplicateDialog } from './duplicate-dialog';
import { Workflow, Copy, Pencil, Trash2 } from 'lucide-react';

interface PolicyTableProps {
  policies: Policy[];
  onEdit: (policy: Policy) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string, scopeOverrides: Record<string, string>) => void;
}

function formatScope(scope: Record<string, string | number | boolean>) {
  const entries = Object.entries(scope).filter(([, v]) => v !== '' && v !== undefined);
  if (entries.length === 0) return '—';
  return entries.map(([k, v]) => `${k}=${v}`).join(', ');
}

export function PolicyTable({
  policies,
  onEdit,
  onDelete,
  onDuplicate,
}: PolicyTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [duplicatePolicy, setDuplicatePolicy] = useState<Policy | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="w-[120px]">Key</TableHead>
            <TableHead className="w-[250px]">Scope</TableHead>
            <TableHead className="w-[80px]">Steps</TableHead>
            <TableHead className="w-[80px]">Rules</TableHead>
            <TableHead className="w-[250px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {policies.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono text-xs">
                  {p.key}
                </Badge>
              </TableCell>
              <TableCell className="text-xs">
                {formatScope(p.scope)}
              </TableCell>
              <TableCell>{p.steps.length}</TableCell>
              <TableCell>{p.decision.rules.length}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="default" size="sm" asChild className="gap-1.5">
                    <Link href={`/builder/${p.id}`}>
                      <Workflow className="h-3.5 w-3.5" />
                      Builder
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDuplicatePolicy(p)}
                    className="gap-1"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Duplicate
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(p)} className="gap-1">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive gap-1"
                    onClick={() => setDeleteId(p.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Policy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this policy? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) onDelete(deleteId);
                setDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {duplicatePolicy && (
        <DuplicateDialog
          open={!!duplicatePolicy}
          onOpenChange={(open) => {
            if (!open) setDuplicatePolicy(null);
          }}
          policy={duplicatePolicy}
          onDuplicate={(scopeOverrides) => {
            onDuplicate(duplicatePolicy.id, scopeOverrides);
            setDuplicatePolicy(null);
          }}
        />
      )}
    </>
  );
}
