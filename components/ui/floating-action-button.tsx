'use client';

import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export function FloatingActionButton({ onClick, className }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "w-14 h-14 lg:w-12 lg:h-12 rounded-full",
        "bg-primary text-primary-foreground",
        "shadow-lg hover:shadow-xl lg:shadow-md",
        "transition-all duration-200",
        "hover:scale-105 active:scale-95",
        "flex items-center justify-center",
        "border-2 border-background lg:border-transparent",
        // En mobile es más prominente, en desktop más discreto
        "lg:opacity-80 lg:hover:opacity-100",
        className
      )}
      aria-label="Agregar transacción"
    >
      <Plus className="h-6 w-6 lg:h-5 lg:w-5" />
    </button>
  );
}
