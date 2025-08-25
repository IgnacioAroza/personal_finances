'use client';

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
import { useUserInitialization } from '@/hooks/useUserInitialization';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useQuickActions } from '@/hooks/useQuickActions';

export default function DashboardPage() {
  const { user, isLoaded, isInitialized } = useUserInitialization();
  const { 
    transactions, 
    totalIncome, 
    totalExpenses, 
    balance, 
    expensesByCategory,
    refetchTransactions 
  } = useTransactions(isLoaded, user);
  
  const { 
    incomeCategories, 
    expenseCategories
  } = useCategories(isLoaded, user);

  const {
    isBottomSheetOpen,
    selectedTransactionType,
    openBottomSheet,
    closeBottomSheet,
    selectTransactionType,
    goBackToSelector
  } = useQuickActions();

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

      {/* Resumen Financiero */}
      <FinancialSummary 
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        balance={balance}
      />

      {/* Formularios Desktop - Solo visible en pantallas grandes */}
      <div className="hidden lg:block mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Registro Rápido</h2>
        <div className="grid grid-cols-2 gap-6">
          <IncomeForm 
            categories={incomeCategories}
            onIncomeAdded={refetchTransactions}
          />
          <ExpenseForm 
            categories={expenseCategories}
            onExpenseAdded={refetchTransactions}
          />
        </div>
      </div>

      {/* Análisis y Historial */}
      <div className="space-y-4">
        <ExpenseAnalysis 
          expensesByCategory={expensesByCategory}
          totalExpenses={totalExpenses}
        />
        <TransactionHistory transactions={transactions} />
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
          onClose={closeBottomSheet}
        />
      </BottomSheet>
    </div>
  );
}
