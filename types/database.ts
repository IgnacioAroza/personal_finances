// Tipos de monedas soportadas
export type Currency = 'ARS' | 'USD' | 'EUR';

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  default_currency: Currency;
  active_currencies: Currency[];
  created_at: string;
  updated_at: string;
}

export interface Categories {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  user_id: string;
  is_active: boolean;
  created_at: string;
}

// Alias para compatibilidad
export type Category = Categories;

export interface Income {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  date: string;
  category_id: string;
  currency: Currency;
  notes: string | null;
  created_at: string;
  updated_at: string;
  categories?: Categories;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  date: string;
  category_id: string;
  currency: Currency;
  notes: string | null;
  created_at: string;
  updated_at: string;
  categories?: Categories;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  category: Categories;
  currency: Currency;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  currency: Currency;
}

export interface ChartData {
  name: string;
  amount: number;
  color: string;
}
