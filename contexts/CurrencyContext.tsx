'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Currency } from '@/types/database';

interface CurrencyContextType {
  currentCurrency: Currency;
  setCurrency: (currency: Currency) => void;
  availableCurrencies: Currency[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currentCurrency, setCurrentCurrency] = useState<Currency>('ARS');

  // Persistir la selección de moneda en localStorage
  useEffect(() => {
    const saved = localStorage.getItem('selected-currency');
    if (saved && ['ARS', 'USD', 'EUR'].includes(saved)) {
      setCurrentCurrency(saved as Currency);
    }
  }, []);

  const setCurrency = (currency: Currency) => {
    setCurrentCurrency(currency);
    localStorage.setItem('selected-currency', currency);
  };

  const availableCurrencies: Currency[] = ['ARS', 'USD', 'EUR'];

  return (
    <CurrencyContext.Provider 
      value={{ 
        currentCurrency, 
        setCurrency, 
        availableCurrencies 
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}