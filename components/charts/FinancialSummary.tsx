'use client';

import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency as formatCurrencyUtil } from '@/lib/utils/currency';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getCurrencySymbol, AVAILABLE_CURRENCIES } from '@/lib/utils/currency';
import type { Currency, Transaction } from '@/types/database';

interface FinancialSummaryProps {
  transactions: Transaction[];
  periodLabel?: string; // Nuevo prop para mostrar el período
}

export default function FinancialSummary({ 
  transactions,
  periodLabel 
}: FinancialSummaryProps) {
  const { currentCurrency } = useCurrency();
  const [displayCurrency, setDisplayCurrency] = useState<Currency>(currentCurrency);
  
  // Calcular totales filtrados por moneda seleccionada
  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    const incomeTransactions = transactions.filter(t => t.type === 'income' && t.currency === displayCurrency);
    const expenseTransactions = transactions.filter(t => t.type === 'expense' && t.currency === displayCurrency);
    
    const income = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const expenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses
    };
  }, [transactions, displayCurrency]);
  
  // Función para obtener el nombre del mes actual por defecto
  const getCurrentMonthName = () => {
    return new Intl.DateTimeFormat('es-ES', { 
      month: 'long',
      year: 'numeric'
    }).format(new Date());
  };

  const displayPeriod = periodLabel || getCurrentMonthName();
  
  // Determinar si mostrar "de" o no basado en el período
  const isTotal = displayPeriod.toLowerCase().includes('total');
  const prefix = isTotal ? '' : 'de ';

  return (
    <div className="mb-6">
      {/* Header con selector de moneda */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Resumen Financiero</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Ver en:</span>
          <Select value={displayCurrency} onValueChange={(value: Currency) => setDisplayCurrency(value)}>
            <SelectTrigger className="w-20 h-8 text-xs">
              <SelectValue>
                <Badge variant="secondary" className="text-xs font-medium">
                  {displayCurrency}
                </Badge>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_CURRENCIES.map((currency) => (
                <SelectItem key={currency} value={currency} className="text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{currency}</span>
                    <span className="text-muted-foreground">{getCurrencySymbol(currency)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Cards de resumen */}
      <div className="grid grid-cols-3 gap-3">
        {/* Ingresos */}
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-xs text-muted-foreground mb-1">
            Ingresos {prefix}
            <br />
            <span className="text-[10px] font-medium">{displayPeriod}</span>
          </div>
          <div className="text-sm font-bold text-green-600">
            {formatCurrencyUtil(totalIncome, displayCurrency)}
          </div>
        </div>

      {/* Gastos */}
      <div className="bg-card border border-border rounded-lg p-3 text-center">
        <div className="flex items-center justify-center mb-1">
          <TrendingDown className="h-4 w-4 text-red-600" />
        </div>
        <div className="text-xs text-muted-foreground mb-1">
          Gastos {prefix}
          <br />
          <span className="text-[10px] font-medium">{displayPeriod}</span>
        </div>
        <div className="text-sm font-bold text-red-600">
          {formatCurrencyUtil(totalExpenses, displayCurrency)}
        </div>
      </div>

      {/* Balance */}
      <div className="bg-card border border-border rounded-lg p-3 text-center">
        <div className="flex items-center justify-center mb-1">
          <DollarSign className="h-4 w-4 text-blue-600" />
        </div>
        <div className="text-xs text-muted-foreground mb-1">
          Balance {prefix}
          <br />
          <span className="text-[10px] font-medium">{displayPeriod}</span>
        </div>
        <div className={`text-sm font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
          {formatCurrencyUtil(balance, displayCurrency)}
        </div>
      </div>
      </div>
    </div>
  );
}
