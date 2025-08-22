import { useState, useEffect } from 'react';
import type { Category } from '@/types/database';
import { ensureUserExists } from '@/lib/user-utils';

export const useCategories = (isLoaded: boolean, user: unknown) => {
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!isLoaded || !user) return;
      
      setLoading(true);
      try {
        // Primero asegurar que el usuario existe en la BD
        const userExists = await ensureUserExists();
        if (!userExists) {
          return;
        }

        const [incomeRes, expenseRes] = await Promise.all([
          fetch('/api/categories?type=income'),
          fetch('/api/categories?type=expense')
        ]);
        
        const incomeData = await incomeRes.json();
        const expenseData = await expenseRes.json();
        
        setIncomeCategories(incomeData.categories || []);
        setExpenseCategories(expenseData.categories || []);
      } catch {
        // Error silencioso
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [isLoaded, user]);

  return {
    incomeCategories,
    expenseCategories,
    loading
  };
};
