'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  SlidersHorizontal,
  HelpCircle,
  FileText,
  Play,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/getting-started', label: 'Getting Started', icon: BookOpen },
  { href: '/parameters', label: '1. Parameters', icon: SlidersHorizontal },
  { href: '/questions', label: '2. Questions', icon: HelpCircle },
  { href: '/policies', label: '3. Policies & Builder', icon: FileText },
  { href: '/demo', label: '4. Demo', icon: Play },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      <aside className="w-60 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <Link href="/getting-started">
            <h1 className="font-bold text-lg hover:text-primary transition-colors">Flow Builder</h1>
          </Link>
          <p className="text-xs text-muted-foreground">Visual Policy Engine</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname.startsWith(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t space-y-2">
          <div className="text-[10px] text-muted-foreground leading-relaxed">
            Parameters &rarr; Questions &rarr; Policy &rarr; Builder &rarr; Demo
          </div>
          <a
            href="https://github.com/jordaobass/flow-builder-next"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
          >
            GitHub Repository
          </a>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
