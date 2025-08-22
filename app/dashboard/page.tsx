'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/theme-toggle';
import { useUserInitialization } from '@/hooks/useUserInitialization';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import FinancialSummary from '@/components/FinancialSummary';
import IncomeForm from '@/components/forms/IncomeForm';
import ExpenseForm from '@/components/forms/ExpenseForm';
import ExpenseAnalysis from '@/components/ExpenseAnalysis';
import TransactionHistory from '@/components/TransactionHistory';

export default function DashboardPage() {
  const { user, isLoaded } = useUserInitialization();
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

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-foreground">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-foreground">No autorizado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestor de Finanzas</h1>
            <p className="text-muted-foreground">Controla tus ingresos y gastos</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Resumen Financiero */}
        <FinancialSummary 
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          balance={balance}
        />

        <Tabs defaultValue="register" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="register">Registrar Movimientos</TabsTrigger>
            <TabsTrigger value="analysis">Análisis</TabsTrigger>
          </TabsList>

          <TabsContent value="register" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <IncomeForm 
                categories={incomeCategories}
                onIncomeAdded={refetchTransactions}
              />
              <ExpenseForm 
                categories={expenseCategories}
                onExpenseAdded={refetchTransactions}
              />
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <ExpenseAnalysis 
              expensesByCategory={expensesByCategory}
              totalExpenses={totalExpenses}
            />
            <TransactionHistory transactions={transactions} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
