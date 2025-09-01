'use client';

import { useEffect } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function BottomSheet({ isOpen, onClose, children, title = 'Nueva Transacción' }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0",
        "bg-background border-t border-border",
        "rounded-t-xl shadow-xl",
        "max-h-[90vh] overflow-y-auto",
        "transform transition-transform duration-300 ease-out",
        isOpen ? "translate-y-0" : "translate-y-full"
      )}>
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}

interface QuickActionSelectorProps {
  onSelectIncome: () => void;
  onSelectExpense: () => void;
}

export function QuickActionSelector({ onSelectIncome, onSelectExpense }: QuickActionSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={onSelectIncome}
        className={cn(
          "p-6 rounded-lg border-2 border-border",
          "hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20",
          "transition-all duration-200",
          "flex flex-col items-center gap-3",
          "group"
        )}
      >
        <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
          <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-foreground">Ingreso</h3>
          <p className="text-sm text-muted-foreground">Registrar dinero recibido</p>
        </div>
      </button>

      <button
        onClick={onSelectExpense}
        className={cn(
          "p-6 rounded-lg border-2 border-border",
          "hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20",
          "transition-all duration-200",
          "flex flex-col items-center gap-3",
          "group"
        )}
      >
        <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
          <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-foreground">Gasto</h3>
          <p className="text-sm text-muted-foreground">Registrar dinero gastado</p>
        </div>
      </button>
    </div>
  );
}
