export interface User {
  id: string;
  clerk_user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  user_id: string;
  is_active: boolean;
  created_at: string;
}

export interface Income {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  date: string;
  category_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  date: string;
  category_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  category: Category;
  notes: string | null;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface ChartData {
  name: string;
  amount: number;
  color: string;
}
