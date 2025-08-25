'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { 
  ThemeToggle, 
  FinancialSummary, 
  IncomeForm, 
  ExpenseForm, 
  ExpenseAnalysis, 
  TransactionHistory 
} from '@/components';
import { useUserInitialization } from '@/hooks/useUserInitialization';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';

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

  // Mostrar mensaje si el usuario no está inicializado
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-foreground mb-4">Inicializando usuario...</div>
          <div className="text-sm text-muted-foreground">
            Clerk ID: {user?.id}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Reintentar
          </button>
        </div>
      </div>
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

      <Tabs defaultValue="register" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 h-9">
          <TabsTrigger value="register" className="text-sm">Registrar</TabsTrigger>
          <TabsTrigger value="analysis" className="text-sm">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

        <TabsContent value="analysis" className="space-y-4">
          <ExpenseAnalysis 
            expensesByCategory={expensesByCategory}
            totalExpenses={totalExpenses}
          />
          <TransactionHistory transactions={transactions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
