'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import { FlowCanvas } from '@/components/builder/flow-canvas';
import { FlowTableView } from '@/components/builder/flow-table-view';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePolicyStore } from '@/stores/policy-store';
import { useQuestionStore } from '@/stores/question-store';
import { useParameterStore } from '@/stores/parameter-store';

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
        <Button variant="ghost" size="sm" asChild>
          <Link href="/policies">Back to Policies</Link>
        </Button>
        <span className="text-sm font-medium">
          {policy ? policy.name : 'Visual Builder'}
        </span>
      </div>
      <Tabs defaultValue="visual" className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList>
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
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
