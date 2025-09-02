'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Button, ConfirmDialog } from '@/components/ui';
import { TrendingUp, TrendingDown, MoreVertical } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Transaction, Category } from '@/types/database';
import { useState } from 'react';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import EditTransactionForm from '@/components/forms/EditTransactionForm';
import { toast } from 'sonner';

interface TransactionHistoryProps {
  transactions: Transaction[];
  limit?: number;
  incomeCategories?: Category[];
  expenseCategories?: Category[];
  onChanged?: () => void;
}

export default function TransactionHistory({ transactions, limit = 10, incomeCategories = [], expenseCategories = [], onChanged }: TransactionHistoryProps) {
  const displayTransactions = transactions.slice(0, limit);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Transacciones</CardTitle>
        <CardDescription>Últimas transacciones registradas</CardDescription>
      </CardHeader>
      <CardContent>
        {displayTransactions.length > 0 ? (
          <div className="space-y-2">
            {displayTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-3 border border-border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {transaction.type === "income" ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.date} • {transaction.category?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold ${
                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Acciones">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditing(transaction)}>
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleting(transaction)}>
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No hay transacciones registradas
          </p>
        )}
      </CardContent>
      <BottomSheet 
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.type === 'income' ? 'Editar Ingreso' : 'Editar Gasto'}
      >
        {editing && (
          <EditTransactionForm
            transaction={editing}
            categories={editing.type === 'income' ? incomeCategories : expenseCategories}
            onSaved={() => onChanged?.()}
            onCancel={() => setEditing(null)}
          />
        )}
      </BottomSheet>
      <ConfirmDialog
        open={!!deleting}
        title={deleting?.type === 'income' ? 'Eliminar Ingreso' : 'Eliminar Gasto'}
        description="Esta acción no se puede deshacer. ¿Deseas continuar?"
        confirmText="Eliminar"
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          const t = deleting;
          setDeleting(null);
          const endpoint = t.type === 'income' ? `/api/income/${t.id}` : `/api/expenses/${t.id}`;
          const res = await fetch(endpoint, { method: 'DELETE' });
          if (res.ok) {
            toast.success('Transacción eliminada');
            onChanged?.();
          } else {
            toast.error('No se pudo eliminar');
          }
        }}
      />
    </Card>
  );
}
