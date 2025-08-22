'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label, Select, Textarea } from '@/components/ui/form';
import { formatDateInput } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import type { Category } from '@/types/database';

interface IncomeForm {
  amount: string;
  description: string;
  date: string;
  category_id: string;
  notes?: string;
}

export default function IncomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IncomeForm>({
    defaultValues: {
      amount: '',
      description: '',
      date: formatDateInput(new Date()),
      category_id: '',
      notes: '',
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories?type=income');
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error obteniendo categorías:', error);
      }
    };

    fetchCategories();
  }, []);

  const onSubmit = async (data: IncomeForm) => {
    setIsLoading(true);
    try {
      // Validar que el monto sea válido
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        alert('Por favor ingresa un monto válido');
        setIsLoading(false);
        return;
      }

      // Preparar datos para enviar
      const formData = {
        amount,
        description: data.description.trim(),
        date: data.date,
        category_id: data.category_id,
        notes: data.notes?.trim() || null,
      };

      const response = await fetch('/api/income', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Ingreso registrado exitosamente');
        reset();
        router.push('/dashboard');
      } else {
        const error = await response.json();
        alert('Error: ' + error.message);
      }
    } catch (error) {
      console.error('Error enviando formulario:', error);
      alert('Error al registrar el ingreso');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Registrar Ingreso</h1>
        <p className="text-gray-400">Añade un nuevo ingreso a tu registro financiero</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            💰 Nuevo Ingreso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('amount', { required: 'El monto es requerido' })}
                />
                {errors.amount && (
                  <p className="text-red-400 text-sm">{String(errors.amount.message)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  {...register('date', { required: 'La fecha es requerida' })}
                />
                {errors.date && (
                  <p className="text-red-400 text-sm">{String(errors.date.message)}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Input
                id="description"
                placeholder="Ej: Salario enero, Proyecto freelance..."
                {...register('description', { required: 'La descripción es requerida' })}
              />
              {errors.description && (
                <p className="text-red-400 text-sm">{String(errors.description.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Categoría *</Label>
              <Select
                id="category_id"
                {...register('category_id', { required: 'La categoría es requerida' })}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </Select>
              {errors.category_id && (
                <p className="text-red-400 text-sm">{String(errors.category_id.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Información adicional..."
                {...register('notes')}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? 'Guardando...' : 'Guardar Ingreso'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
