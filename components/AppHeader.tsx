'use client';

import Link from 'next/link';
import { useUserInitialization } from '@/hooks/useUserInitialization';
import { CurrencySelector } from '@/components/ui/currency-selector';
import { UserNav } from '@/components/user-nav';

export function AppHeader() {
  const { user, isLoaded } = useUserInitialization();

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex justify-between items-center p-4 h-16">
        <Link href="/dashboard" className="text-xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer">
          💰 Finanzas
        </Link>
        <div className="flex items-center gap-4">
          {isLoaded && user && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">Preferida:</span>
              <CurrencySelector variant="compact" />
            </div>
          )}
          <UserNav />
        </div>
      </div>
    </header>
  );
}