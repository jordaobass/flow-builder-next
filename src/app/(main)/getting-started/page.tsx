'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  SlidersHorizontal,
  HelpCircle,
  Workflow,
  Play,
  ArrowRight,
} from 'lucide-react';

const STEPS = [
  {
    number: 1,
    title: 'Define Parameters',
    href: '/parameters',
    color: 'bg-blue-500',
    icon: SlidersHorizontal,
    btnLabel: 'Go to Parameters',
    description:
      'Create the scope fields that will filter which policy applies. For example: country, state, city, companyId. These parameters define the "context" in which a policy is selected.',
    example: 'Ex: country=BR, state=SP means this policy only applies to Brazil/SP.',
  },
  {
    number: 2,
    title: 'Create Questions',
    href: '/questions',
    color: 'bg-emerald-500',
    icon: HelpCircle,
    btnLabel: 'Go to Questions',
    description:
      'Build a question bank. Each question has a type (boolean, select, text, number) and will be used inside policy flows as steps the user must answer.',
    example: 'Ex: "Did the driver work?" (boolean), "Vehicle condition?" (select: Good/Fair/Poor).',
  },
  {
    number: 3,
    title: 'Build Policies & Visual Flow',
    href: '/policies',
    color: 'bg-purple-500',
    icon: Workflow,
    btnLabel: 'Go to Policies',
    description:
      'A policy combines a scope (filter), questions (steps), and decision rules. After creating a policy, click the "Builder" button to open the visual flow editor where you drag & drop nodes.',
    example:
      'Ex: Policy "Uber Release BR/SP" with scope country=BR, state=SP. Click the "Builder" button to design the flow visually.',
  },
  {
    number: 4,
    title: 'Test with Demo',
    href: '/demo',
    color: 'bg-amber-500',
    icon: Play,
    btnLabel: 'Go to Demo',
    description:
      'Enter context values (country, state, etc.) and the engine automatically finds the best matching policy. Then answer the questions and see the decision result (ALLOW/BLOCK/REVIEW).',
    example:
      'Ex: Enter country=BR, state=SP. The engine selects the matching policy and runs its questionnaire.',
  },
];

export default function GettingStartedPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Getting Started</h2>
        <p className="text-muted-foreground">
          Flow Builder lets you create visual decision flows for compliance policies.
          Follow these 4 steps to get up and running.
        </p>
      </div>

      {/* How it works summary */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>
            <strong>Scope parameters</strong> (country, state, company...) determine <strong>which policy</strong> is selected.
            Each policy has its own <strong>visual flow</strong> of questions and conditions that produce a final decision.
          </p>
          <p>
            You can have multiple policies with different scopes. When a user runs the demo,
            the engine automatically picks the best matching policy and executes its flow.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-medium">
            <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-blue-100 text-blue-700">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Parameters
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-emerald-100 text-emerald-700">
              <HelpCircle className="h-3.5 w-3.5" /> Questions
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-purple-100 text-purple-700">
              <Workflow className="h-3.5 w-3.5" /> Policy + Builder
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-amber-100 text-amber-700">
              <Play className="h-3.5 w-3.5" /> Demo
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="space-y-4">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <Card key={step.number} className="overflow-hidden">
              <div className="flex">
                <div
                  className={`${step.color} w-16 flex flex-col items-center justify-center text-white shrink-0 gap-1`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-bold">{step.number}</span>
                </div>
                <div className="flex-1 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    <Button size="sm" asChild className="gap-1.5">
                      <Link href={step.href}>
                        {step.btnLabel}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  <p className="text-xs text-muted-foreground italic border-l-2 pl-3">
                    {step.example}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Visual Builder detail */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Workflow className="h-5 w-5 text-purple-500" />
            About the Visual Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>
            The builder (accessible from <strong>Policies &rarr;</strong>{' '}
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
              <Workflow className="h-3 w-3" /> Builder
            </span>{' '}
            button) has two views:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Visual tab</strong> — Drag-and-drop React Flow editor with 4 node types:</li>
            <ul className="list-none pl-4 space-y-1">
              <li className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded bg-blue-400"></span>
                <strong>Filter</strong> — Shows the policy scope (country, state...)
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded bg-gray-300"></span>
                <strong>Question</strong> — A step the user must answer
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded bg-purple-400"></span>
                <strong>Condition</strong> — Evaluates an answer (true/false branches)
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded bg-green-400"></span>
                <strong>End</strong> — Final decision (ALLOW / BLOCK / REVIEW)
              </li>
            </ul>
            <li><strong>Table tab</strong> — Read-only tabular summary of scope, steps, and rules</li>
          </ul>
          <p>
            In the left panel you can <strong>add nodes</strong> and <strong>inspect/edit</strong> properties of the selected node.
            Click <strong>Save Changes</strong> when done.
          </p>
        </CardContent>
      </Card>

      {/* Quick start CTA */}
      <div className="flex justify-center gap-4 pt-4">
        <Button asChild size="lg" className="gap-2">
          <Link href="/parameters">
            <SlidersHorizontal className="h-4 w-4" />
            Start Building
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="gap-2">
          <Link href="/demo">
            <Play className="h-4 w-4" />
            Try the Demo
          </Link>
        </Button>
      </div>
    </div>
  );
}
