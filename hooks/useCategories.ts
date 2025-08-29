import { useState, useEffect } from 'react';
import type { Category } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

export const useCategories = (isLoaded: boolean, user: unknown) => {
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!isLoaded || !user) return;
      
      setLoading(true);
      try {
        const supabase = createClient();
        
        // Verificar que tenemos un usuario autenticado
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !currentUser) {
          return;
        }

        // Obtener categorías de ingresos
        const { data: incomeData, error: incomeError } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('type', 'income')
          .eq('is_active', true)
          .order('name', { ascending: true });

        // Obtener categorías de gastos
        const { data: expenseData, error: expenseError } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('type', 'expense')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (incomeError) {
          console.error('Error al obtener categorías de ingresos:', incomeError);
        }
        
        if (expenseError) {
          console.error('Error al obtener categorías de gastos:', expenseError);
        }
        
        setIncomeCategories(incomeData || []);
        setExpenseCategories(expenseData || []);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
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
