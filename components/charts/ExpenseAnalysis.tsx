'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ExpenseAnalysisProps {
  expensesByCategory: Record<string, number>;
  totalExpenses: number;
}

export default function ExpenseAnalysis({ expensesByCategory, totalExpenses }: ExpenseAnalysisProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-4 w-4" />
          Análisis de Gastos por Categoría
        </CardTitle>
        <CardDescription className="text-sm">Distribución de tus gastos por categoría</CardDescription>
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
                    {formatCurrency(amount)}
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
