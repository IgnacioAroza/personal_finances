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
import { PlusCircle, TrendingUp, Plus } from 'lucide-react';
import CategoryModal from '@/components/categories/CategoryModal';
import { toast } from 'sonner';
import type { Categories } from '@/types/database';

interface IncomeFormProps {
  categories: Categories[];
  onIncomeAdded: () => void;
  onCategoriesRefresh: () => void;
}

interface IncomeFormData {
  amount: string;
  description: string;
  date: string;
  category_id: string;
}

export default function IncomeForm({ categories, onIncomeAdded, onCategoriesRefresh }: IncomeFormProps) {
  const [form, setForm] = useState<IncomeFormData>({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    category_id: "",
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
      const response = await fetch('/api/income', {
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
        toast.success('Ingreso agregado exitosamente');
        onIncomeAdded();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al crear el ingreso');
      }
    } catch (error) {
      console.error('Error creating income:', error);
      toast.error('Error al crear el ingreso');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryCreated = (newCategory: Categories) => {
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

  const updateForm = (field: keyof IncomeFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Registrar Ingreso
          </CardTitle>
          <CardDescription>Añade un nuevo ingreso a tu registro</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="income-amount">Monto</Label>
            <Input
              id="income-amount"
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => updateForm('amount', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="income-description">Descripción</Label>
            <Input
              id="income-description"
              placeholder="Descripción del ingreso"
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="income-category">Categoría</Label>
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
            <Label htmlFor="income-date">Fecha</Label>
            <Input
              id="income-date"
              type="date"
              value={form.date}
              onChange={(e) => updateForm('date', e.target.value)}
            />
          </div>
          <Button onClick={handleSubmit} className="w-full" disabled={loading}>
            <PlusCircle className="h-4 w-4 mr-2" />
            {loading ? 'Añadiendo...' : 'Añadir Ingreso'}
          </Button>
        </CardContent>
      </Card>

      {/* Modal de nueva categoría */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSuccess={handleCategoryCreated}
        defaultType="income"
      />
    </>
  );
}
