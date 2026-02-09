'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import { FlowCanvas } from '@/components/builder/flow-canvas';
import { FlowTableView } from '@/components/builder/flow-table-view';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { usePolicyStore } from '@/stores/policy-store';
import { useQuestionStore } from '@/stores/question-store';
import { useParameterStore } from '@/stores/parameter-store';
import { useBuilderStore } from '@/stores/builder-store';
import { ArrowLeft, LayoutGrid, Table } from 'lucide-react';

export default function BuilderPage({
  params,
}: {
  params: Promise<{ policyId: string }>;
}) {
  const { policyId } = use(params);

  const { hydrate: hydratePolicies, hydrated: policiesHydrated, getPolicy } =
    usePolicyStore();
  const { hydrate: hydrateQuestions, hydrated: questionsHydrated } =
    useQuestionStore();
  const { hydrate: hydrateParams } = useParameterStore();
  const dirty = useBuilderStore((s) => s.dirty);

  useEffect(() => {
    hydratePolicies();
    hydrateQuestions();
    hydrateParams();
  }, [hydratePolicies, hydrateQuestions, hydrateParams]);

  if (!policiesHydrated || !questionsHydrated) return null;

  const policy = getPolicy(policyId);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-4 px-4 py-2 border-b bg-background">
        {dirty ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ArrowLeft className="size-3.5" />
                Back to Policies
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
                <AlertDialogDescription>
                  You have unsaved changes that will be lost if you leave this page. Are you sure you want to go back?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Stay</AlertDialogCancel>
                <AlertDialogAction variant="destructive" asChild>
                  <Link href="/policies">Leave without saving</Link>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button variant="ghost" size="sm" asChild className="gap-1.5">
            <Link href="/policies">
              <ArrowLeft className="size-3.5" />
              Back to Policies
            </Link>
          </Button>
        )}
        <span className="text-sm font-medium">
          {policy ? policy.name : 'Visual Builder'}
        </span>
        {dirty && (
          <span className="size-2 rounded-full bg-amber-500" title="Unsaved changes" />
        )}
      </div>
      <Tabs defaultValue="visual" className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList>
            <TabsTrigger value="visual" className="gap-1.5">
              <LayoutGrid className="size-3.5" />
              Visual
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-1.5">
              <Table className="size-3.5" />
              Table
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="visual" className="flex-1 mt-0">
          <FlowCanvas policyId={policyId} />
        </TabsContent>
        <TabsContent value="table" className="flex-1 mt-0 overflow-auto">
          {policy ? (
            <FlowTableView policy={policy} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Policy not found: {policyId}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
