'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Button, ConfirmDialog } from '@/components/ui';
import { TrendingUp, TrendingDown, MoreVertical, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Transaction, Category } from '@/types/database';
import { useState, useEffect } from 'react';
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

// Componente para renderizar cada transacción
const TransactionItem: React.FC<{
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}> = ({ transaction, onEdit, onDelete }) => (
  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
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
          <DropdownMenuItem onClick={() => onEdit(transaction)}>
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(transaction)}>
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
);

export default function TransactionHistory({ transactions, limit = 5, incomeCategories = [], expenseCategories = [], onChanged }: TransactionHistoryProps) {
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(limit);
  const [showAllMobile, setShowAllMobile] = useState(false); // Para "Mostrar más" en móvil
  
  // Estados existentes
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  // Cálculos de paginación
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  // Transacciones a mostrar
  const paginatedTransactions = transactions.slice(startIndex, endIndex);
  
  // Para móvil: mostrar más transacciones progresivamente O usar paginación
  const mobileDisplayCount = showAllMobile ? transactions.length : itemsPerPage;
  const mobileTransactions = showAllMobile ? transactions : paginatedTransactions;
  const hasMoreToShow = !showAllMobile && transactions.length > itemsPerPage;

  // Información de paginación
  const startItem = startIndex + 1;
  const endItem = Math.min(endIndex, transactions.length);

  // Funciones de navegación
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Resetear página cuando cambian las transacciones
  const resetPagination = () => {
    setCurrentPage(1);
    setShowAllMobile(false);
  };

  // Efecto para resetear paginación cuando cambian las transacciones
  useEffect(() => {
    resetPagination();
  }, [transactions.length]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Transacciones</CardTitle>
        <CardDescription>
          Últimas transacciones registradas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <>
            {/* Lista de transacciones - Desktop: paginadas, Mobile: mostrar más */}
            <div className="space-y-2">
              {/* Desktop: usar paginación clásica */}
              <div className="hidden sm:block">
                {paginatedTransactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={setEditing}
                    onDelete={setDeleting}
                  />
                ))}
              </div>
              
              {/* Mobile: usar "mostrar más" */}
              <div className="block sm:hidden">
                {mobileTransactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={setEditing}
                    onDelete={setDeleting}
                  />
                ))}
              </div>
            </div>

            {/* Controles de paginación - Desktop */}
            {transactions.length > itemsPerPage && (
              <div className="hidden sm:flex items-center justify-between mt-4 pt-4 border-t border-border">
                {/* Información de paginación */}
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {startItem} a {endItem} de {transactions.length} transacciones
                  </p>
                  
                  {/* Selector de elementos por página */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Mostrar:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="text-sm border border-border rounded px-2 py-1 bg-background"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                {/* Controles de navegación */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {/* Números de página */}
                  <div className="flex items-center gap-1 mx-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Botón "Mostrar más" - Mobile (solo si no estamos mostrando todo) */}
            {hasMoreToShow && (
              <div className="block sm:hidden mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAllMobile(true)}
                  className="w-full border-2 border-dashed border-border hover:border-solid hover:bg-accent/30 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02]"
                >
                  <span className="text-sm">
                    Mostrar más transacciones ({transactions.length - mobileDisplayCount} restantes)
                  </span>
                </Button>
              </div>
            )}

            {/* Navegación simple para móvil - Solo cuando hay paginación */}
            {transactions.length > itemsPerPage && !showAllMobile && (
              <div className="block sm:hidden mt-4 space-y-3">
                {/* Información de página */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages} • {transactions.length} transacciones
                  </p>
                </div>
                
                {/* Controles de navegación */}
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="flex-1"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  
                  <div className="px-3 py-1 bg-muted rounded text-sm font-medium">
                    {currentPage}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="flex-1"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                
                {/* Opción para mostrar todo */}
                <div className="text-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowAllMobile(true)}
                      className="bg-muted/50 hover:bg-muted border border-border px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  >
                    <span className="text-sm">Ver todas las {transactions.length} transacciones</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Botón para volver a paginación cuando se muestran todas en móvil */}
            {showAllMobile && transactions.length > itemsPerPage && (
              <div className="block sm:hidden mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllMobile(false)}
                  className="border-2 border-dashed border-border hover:border-solid hover:bg-accent/50 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Volver a paginación
                </Button>
              </div>
            )}
          </>
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
