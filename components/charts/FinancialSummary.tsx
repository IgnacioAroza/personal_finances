'use client';

import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface FinancialSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export default function FinancialSummary({ totalIncome, totalExpenses, balance }: FinancialSummaryProps) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {/* Ingresos */}
      <div className="bg-card border border-border rounded-lg p-3 text-center">
        <div className="flex items-center justify-center mb-1">
          <TrendingUp className="h-4 w-4 text-green-600" />
        </div>
        <div className="text-xs text-muted-foreground mb-1">Ingresos</div>
        <div className="text-sm font-bold text-green-600">
          {formatCurrency(totalIncome)}
        </div>
      </div>

      {/* Gastos */}
      <div className="bg-card border border-border rounded-lg p-3 text-center">
        <div className="flex items-center justify-center mb-1">
          <TrendingDown className="h-4 w-4 text-red-600" />
        </div>
        <div className="text-xs text-muted-foreground mb-1">Gastos</div>
        <div className="text-sm font-bold text-red-600">
          {formatCurrency(totalExpenses)}
        </div>
      </div>

      {/* Balance */}
      <div className="bg-card border border-border rounded-lg p-3 text-center">
        <div className="flex items-center justify-center mb-1">
          <DollarSign className="h-4 w-4 text-blue-600" />
        </div>
        <div className="text-xs text-muted-foreground mb-1">Balance</div>
        <div className={`text-sm font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
          {formatCurrency(balance)}
        </div>
      </div>
    </div>
  );
}
