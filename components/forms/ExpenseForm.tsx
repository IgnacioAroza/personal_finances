'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';
import { Label } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, TrendingDown } from 'lucide-react';
import type { Category } from '@/types/database';

interface ExpenseFormProps {
  categories: Category[];
  onExpenseAdded: () => void;
}

interface ExpenseFormData {
  amount: string;
  description: string;
  date: string;
  category_id: string;
}

export default function ExpenseForm({ categories, onExpenseAdded }: ExpenseFormProps) {
  const [form, setForm] = useState<ExpenseFormData>({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    category_id: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.amount || !form.description || !form.category_id) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(form.amount),
          description: form.description,
          date: form.date,
          category_id: form.category_id,
        }),
      });

      if (response.ok) {
        setForm({
          amount: "",
          description: "",
          date: new Date().toISOString().split("T")[0],
          category_id: "",
        });
        onExpenseAdded();
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: keyof ExpenseFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-red-600" />
          Registrar Gasto
        </CardTitle>
        <CardDescription>Añade un nuevo gasto a tu registro</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="expense-amount">Monto</Label>
          <Input
            id="expense-amount"
            type="number"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => updateForm('amount', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expense-description">Descripción</Label>
          <Input
            id="expense-description"
            placeholder="Descripción del gasto"
            value={form.description}
            onChange={(e) => updateForm('description', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expense-category">Categoría</Label>
          <Select
            value={form.category_id}
            onValueChange={(value) => updateForm('category_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="expense-date">Fecha</Label>
          <Input
            id="expense-date"
            type="date"
            value={form.date}
            onChange={(e) => updateForm('date', e.target.value)}
          />
        </div>
        <Button onClick={handleSubmit} className="w-full" disabled={loading}>
          <PlusCircle className="h-4 w-4 mr-2" />
          {loading ? 'Añadiendo...' : 'Añadir Gasto'}
        </Button>
      </CardContent>
    </Card>
  );
}
