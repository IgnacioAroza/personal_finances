import { useState, useEffect, useCallback } from 'react';
import type { Income, Expense, Transaction, Currency } from '@/types/database';
import { ensureUserExists } from '@/lib/user-utils';
import { getRange, type Timeframe } from '@/lib/utils/date';

interface TransactionOptions {
  timeframe?: Timeframe;
  referenceDate?: Date;
  currency?: Currency;
}

export const useTransactions = (
  isLoaded: boolean, 
  user: unknown, 
  opts: TransactionOptions = {}
) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar transacciones
  const fetchTransactions = useCallback(async () => {
    if (!isLoaded || !user) return;
    
    setLoading(true);
    try {
      // Primero asegurar que el usuario existe en la BD
      const userExists = await ensureUserExists();
      if (!userExists) {
        return;
      }

      // Construir query params para filtros de fecha y moneda
      const params = new URLSearchParams();
      
      if (opts.timeframe && opts.timeframe !== 'all') {
        const range = getRange(opts.timeframe, opts.referenceDate || new Date());
        if (range) {
          params.set('from', range.from);
          params.set('to', range.to);
        }
      }
      
      if (opts.currency) {
        params.set('currency', opts.currency);
      }
      
      const queryString = params.toString();
      const queryParams = queryString ? `?${queryString}` : '';

      const [incomeRes, expenseRes] = await Promise.all([
        fetch(`/api/income${queryParams}`),
        fetch(`/api/expenses${queryParams}`)
      ]);
      
      const incomeData = await incomeRes.json();
      const expenseData = await expenseRes.json();
      
      const allTransactions: Transaction[] = [
        ...(incomeData || []).map((income: Income) => ({
          id: income.id,
          type: 'income' as const,
          amount: income.amount,
          description: income.description,
          date: income.date,
          currency: income.currency,
          category: income.categories || { id: '', name: 'Sin categoría', icon: '📦', color: '#6B7280' },
          notes: income.notes,
          created_at: income.created_at,
          updated_at: income.updated_at,
        })),
        ...(expenseData || []).map((expense: Expense) => ({
          id: expense.id,
          type: 'expense' as const,
          amount: expense.amount,
          description: expense.description,
          date: expense.date,
          currency: expense.currency,
          category: expense.categories || { id: '', name: 'Sin categoría', icon: '📦', color: '#6B7280' },
          notes: expense.notes,
          created_at: expense.created_at,
          updated_at: expense.updated_at,
        }))
      ];
      
      setTransactions(allTransactions.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
    } catch {
      // Error silencioso
    } finally {
      setLoading(false);
    }
  }, [isLoaded, user, opts.timeframe, opts.referenceDate, opts.currency]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Calcular totales
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Calcular gastos por categoría
  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        const categoryName = t.category?.name || 'Sin categoría';
        acc[categoryName] = (acc[categoryName] || 0) + t.amount;
        return acc;
      },
      {} as Record<string, number>
    );

  return {
    transactions,
    loading,
    totalIncome,
    totalExpenses,
    balance,
    expensesByCategory,
    refetchTransactions: fetchTransactions
  };
};
