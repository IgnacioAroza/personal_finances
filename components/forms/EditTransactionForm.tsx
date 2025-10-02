'use client';

import { useState } from 'react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import type { Category, Transaction, Currency } from '@/types/database';

interface EditTransactionFormProps {
  transaction: Transaction;
  categories: Category[];
  onSaved: () => void;
  onCancel: () => void;
}

export default function EditTransactionForm({ transaction, categories, onSaved, onCancel }: EditTransactionFormProps) {
  const [amount, setAmount] = useState<string>(String(transaction.amount));
  const [description, setDescription] = useState<string>(transaction.description || '');
  const [date, setDate] = useState<string>(transaction.date);
  const [categoryId, setCategoryId] = useState<string>(transaction.category?.id || '');
  const [currency, setCurrency] = useState<Currency>(transaction.currency);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const endpoint = transaction.type === 'income' ? `/api/income/${transaction.id}` : `/api/expenses/${transaction.id}`;
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description,
          date,
          category_id: categoryId,
          currency,
        }),
      });
      if (!res.ok) return;
      onSaved();
      onCancel();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-amount">Monto</Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input 
              id="edit-amount" 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-20">
            <Select value={currency} onValueChange={(value: Currency) => setCurrency(value)}>
              <SelectTrigger className="w-full text-xs px-2">
                <SelectValue>
                  {currency}
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
        <Label htmlFor="edit-description">Descripción</Label>
        <Input id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-category">Categoría</Label>
        <Select value={categoryId} onValueChange={(value) => setCategoryId(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.icon} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-date">Fecha</Label>
        <Input id="edit-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="w-1/2" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button className="w-1/2" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </div>
  );
}

