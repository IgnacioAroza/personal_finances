'use client';

import { ArrowLeft } from 'lucide-react';
import { IncomeForm, ExpenseForm } from '@/components';
import { QuickActionSelector } from '@/components/ui';
import { TransactionType } from '@/hooks/useQuickActions';
import { Category } from '@/types/database';

interface QuickTransactionFormProps {
  selectedType: TransactionType;
  incomeCategories: Category[];
  expenseCategories: Category[];
  onSelectIncome: () => void;
  onSelectExpense: () => void;
  onGoBack: () => void;
  onTransactionAdded: () => void;
  onCategoriesRefresh: () => void;
  onClose: () => void;
}

export function QuickTransactionForm({
  selectedType,
  incomeCategories,
  expenseCategories,
  onSelectIncome,
  onSelectExpense,
  onGoBack,
  onTransactionAdded,
  onCategoriesRefresh,
  onClose
}: QuickTransactionFormProps) {

  const handleTransactionAdded = () => {
    onTransactionAdded();
    onClose(); // Cerrar el bottom sheet después de agregar
  };

  if (!selectedType) {
    return (
      <QuickActionSelector
        onSelectIncome={onSelectIncome}
        onSelectExpense={onSelectExpense}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con botón de regreso */}
      <div className="flex items-center gap-3">
        <button
          onClick={onGoBack}
          className="p-2 hover:bg-muted rounded-full transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-semibold">
          {selectedType === 'income' ? 'Nuevo Ingreso' : 'Nuevo Gasto'}
        </h3>
      </div>

      {/* Formulario correspondiente */}
      {selectedType === 'income' ? (
        <IncomeForm
          categories={incomeCategories}
          onIncomeAdded={handleTransactionAdded}
          onCategoriesRefresh={onCategoriesRefresh}
        />
      ) : (
        <ExpenseForm
          categories={expenseCategories}
          onExpenseAdded={handleTransactionAdded}
          onCategoriesRefresh={onCategoriesRefresh}
        />
      )}
    </div>
  );
}
