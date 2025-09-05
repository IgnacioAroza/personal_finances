'use client';

import { useState } from 'react';
import { FloatingActionButton, BottomSheet, LoadingState } from '@/components/ui';
import { 
  ThemeToggle, 
  FinancialSummary, 
  IncomeForm, 
  ExpenseForm, 
  ExpenseAnalysis, 
  TransactionHistory,
  QuickTransactionForm
} from '@/components';
import { TimeframeFilter } from '@/components/filters/TimeframeFilter';
import { useUserInitialization } from '@/hooks/useUserInitialization';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useQuickActions } from '@/hooks/useQuickActions';
import type { Timeframe } from '@/lib/utils/date';

export default function DashboardPage() {
  const { user, isLoaded, isInitialized } = useUserInitialization();
  
  // Estados del filtro de tiempo
  const [timeframe, setTimeframe] = useState<Timeframe>('all');
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  
  const { 
    transactions, 
    totalIncome, 
    totalExpenses, 
    balance, 
    expensesByCategory,
    refetchTransactions 
  } = useTransactions(isLoaded, user, { timeframe, referenceDate });
  
  const { 
    incomeCategories, 
    expenseCategories,
    refresh: refreshCategories
  } = useCategories(isLoaded, user);

  const {
    isBottomSheetOpen,
    selectedTransactionType,
    openBottomSheet,
    closeBottomSheet,
    selectTransactionType,
    goBackToSelector
  } = useQuickActions();

  // Función para generar el label del período basado en el filtro
  const getPeriodLabel = (): string => {
    switch (timeframe) {
      case 'all':
        return 'Totales';
      case 'day':
        return new Intl.DateTimeFormat('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(referenceDate);
      case 'week':
        return `Semana del ${new Intl.DateTimeFormat('es-ES', {
          day: 'numeric',
          month: 'short'
        }).format(referenceDate)}`;
      case 'month':
        return new Intl.DateTimeFormat('es-ES', {
          month: 'long',
          year: 'numeric'
        }).format(referenceDate);
      default:
        return 'Totales';
    }
  };

  if (!isLoaded) {
    return <LoadingState message="Cargando aplicación" />;
  }

  if (!user) {
    return <LoadingState message="Error de autenticación" showRetry onRetry={() => window.location.reload()} />;
  }

  // Mostrar spinner elegante si el usuario no está inicializado
  if (!isInitialized) {
    return (
      <LoadingState 
        message="Configurando tu cuenta" 
        showRetry 
        onRetry={() => window.location.reload()} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestor de Finanzas</h1>
          <p className="text-sm text-muted-foreground">Controla tus ingresos y gastos</p>
        </div>
        <ThemeToggle />
      </div>

      {/* Filtro de Tiempo */}
      <div className="mb-6">
        <TimeframeFilter
          value={timeframe}
          onChange={setTimeframe}
          referenceDate={referenceDate}
          onReferenceDateChange={setReferenceDate}
        />
      </div>

      {/* Resumen Financiero */}
      <FinancialSummary 
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        balance={balance}
        periodLabel={getPeriodLabel()}
      />

      {/* Formularios Desktop - Solo visible en pantallas grandes */}
      <div className="hidden lg:block mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Registro Rápido</h2>
        <div className="grid grid-cols-2 gap-6">
          <IncomeForm 
            categories={incomeCategories}
            onIncomeAdded={refetchTransactions}
            onCategoriesRefresh={refreshCategories}
          />
          <ExpenseForm 
            categories={expenseCategories}
            onExpenseAdded={refetchTransactions}
            onCategoriesRefresh={refreshCategories}
          />
        </div>
      </div>

      {/* Análisis y Historial */}
      <div className="space-y-4">
        <ExpenseAnalysis 
          expensesByCategory={expensesByCategory}
          totalExpenses={totalExpenses}
        />
        <TransactionHistory 
          transactions={transactions} 
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
          onChanged={refetchTransactions}
        />
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={openBottomSheet} />

      {/* Bottom Sheet para agregar transacciones rápidamente */}
      <BottomSheet isOpen={isBottomSheetOpen} onClose={closeBottomSheet}>
        <QuickTransactionForm
          selectedType={selectedTransactionType}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
          onSelectIncome={() => selectTransactionType('income')}
          onSelectExpense={() => selectTransactionType('expense')}
          onGoBack={goBackToSelector}
          onTransactionAdded={refetchTransactions}
          onCategoriesRefresh={refreshCategories}
          onClose={closeBottomSheet}
        />
      </BottomSheet>
    </div>
  );
}
