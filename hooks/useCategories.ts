import { useState, useEffect } from 'react';
import type { Category } from '@/types/database';

export const useCategories = (isLoaded: boolean, user: unknown) => {
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!isLoaded || !user) return;
      
      setLoading(true);
      try {
        const [incomeRes, expenseRes] = await Promise.all([
          fetch('/api/categories?type=income'),
          fetch('/api/categories?type=expense')
        ]);
        
        const incomeData = await incomeRes.json();
        const expenseData = await expenseRes.json();
        
        setIncomeCategories(incomeData.categories || []);
        setExpenseCategories(expenseData.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
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
