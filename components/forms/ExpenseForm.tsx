'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Label
} from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { CurrencySelector } from '@/components/ui/currency-selector'; // Usamos un selector local
import { useCurrency } from '@/contexts/CurrencyContext';
import { PlusCircle, TrendingDown, Plus } from 'lucide-react';
import CategoryModal from '@/components/categories/CategoryModal';
import { toast } from 'sonner';
import type { Category, Currency } from '@/types/database';

interface ExpenseFormProps {
  categories: Category[];
  onExpenseAdded: () => void;
  onCategoriesRefresh: () => void;
}

interface ExpenseFormData {
  amount: string;
  description: string;
  date: string;
  category_id: string;
  currency: Currency;
}

export default function ExpenseForm({ categories, onExpenseAdded, onCategoriesRefresh }: ExpenseFormProps) {
  const { currentCurrency } = useCurrency();
  
  const [form, setForm] = useState<ExpenseFormData>({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    category_id: "",
    currency: currentCurrency,
  });
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handleSubmit = async () => {
    if (!form.amount || !form.category_id) {
      toast.error('Por favor completa el monto y selecciona una categoría');
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
          currency: form.currency,
        }),
      });

      if (response.ok) {
        setForm(prev => ({
          amount: "",
          description: "",
          date: new Date().toISOString().split("T")[0],
          category_id: "",
          currency: prev.currency, // Mantener la moneda seleccionada por el usuario
        }));
        toast.success('Gasto agregado exitosamente');
        onExpenseAdded();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al crear el gasto');
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Error al crear el gasto');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryCreated = (newCategory: Category) => {
    // Validar que la categoría tenga ID
    if (!newCategory || !newCategory.id) {
      console.error('Categoría inválida recibida:', newCategory);
      toast.error('Error: Categoría creada sin ID válido');
      return;
    }
    
    // Setear la nueva categoría como seleccionada
    setForm(prev => ({ ...prev, category_id: newCategory.id }));
    // Refrescar la lista de categorías
    onCategoriesRefresh();
  };

  const updateForm = (field: keyof ExpenseFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
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
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="expense-amount"
                  type="number"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => updateForm('amount', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-20">
                <Select value={form.currency} onValueChange={(value: Currency) => updateForm('currency', value)}>
                  <SelectTrigger className="w-full text-xs px-2">
                    <SelectValue>
                      {form.currency}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ARS" className="text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">ARS</span>
                        <span className="text-muted-foreground">$</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="USD" className="text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">USD</span>
                        <span className="text-muted-foreground">U$D</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="EUR" className="text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">EUR</span>
                        <span className="text-muted-foreground">€</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
            <div className="flex gap-2">
              <Select
                value={form.category_id}
                onValueChange={(value) => updateForm('category_id', value)}
              >
                <SelectTrigger className="flex-1">
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
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowCategoryModal(true)}
                title="Nueva categoría"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
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

      {/* Modal de nueva categoría */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSuccess={handleCategoryCreated}
        defaultType="expense"
      />
    </>
  );
}
