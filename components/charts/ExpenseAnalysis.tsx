'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import type { Transaction, Currency } from '@/types/database';
import { useState, useMemo } from 'react';

interface ExpenseAnalysisProps {
  transactions: Transaction[];
}

export default function ExpenseAnalysis({ transactions }: ExpenseAnalysisProps) {
  const [displayCurrency, setDisplayCurrency] = useState<Currency | 'all'>('all');
  
  // Filtrar y calcular datos por moneda
  const { expensesByCategory, totalExpenses } = useMemo(() => {
    const filteredTransactions = displayCurrency === 'all' 
      ? transactions 
      : transactions.filter(t => t.currency === displayCurrency);
    
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    const byCategory = expenses.reduce(
      (acc, t) => {
        const categoryName = t.category?.name || 'Sin categoría';
        acc[categoryName] = (acc[categoryName] || 0) + t.amount;
        return acc;
      },
      {} as Record<string, number>
    );
    
    return { expensesByCategory: byCategory, totalExpenses: total };
  }, [transactions, displayCurrency]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-4 w-4" />
              Análisis de Gastos por Categoría
            </CardTitle>
            <CardDescription className="text-sm">Distribución de tus gastos por categoría</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Moneda:</span>
            <Select value={displayCurrency} onValueChange={(value: Currency | 'all') => setDisplayCurrency(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="ARS">ARS</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(expensesByCategory).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(expensesByCategory).map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{category}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-secondary rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${(amount / totalExpenses) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-foreground min-w-[4rem] text-right">
                    {formatCurrency(amount, displayCurrency === 'all' ? 'ARS' : displayCurrency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-6 text-sm">
            No hay gastos registrados para mostrar análisis
          </p>
        )}
      </CardContent>
    </Card>
  );
}
