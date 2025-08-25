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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Análisis de Gastos por Categoría
        </CardTitle>
        <CardDescription>Distribución de tus gastos por categoría</CardDescription>
      </CardHeader>
      <CardContent>
        {Object.keys(expensesByCategory).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(expensesByCategory).map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="font-medium">{category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(amount / totalExpenses) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(amount)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No hay gastos registrados para mostrar análisis
          </p>
        )}
      </CardContent>
    </Card>
  );
}
