'use client'

import { useMemo, useState } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle, LoadingState, Input } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { useUserInitialization } from '@/hooks/useUserInitialization'
import { useCategories } from '@/hooks/useCategories'
import CategoryModal from '@/components/categories/CategoryModal'
import EditCategoryModal from '@/components/categories/EditCategoryModal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { Category } from '@/types/database'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, RotateCcw, Search } from 'lucide-react'

export default function ProfilePage() {
  const { user, isLoaded, isInitialized } = useUserInitialization()
  const { incomeCategories, expenseCategories, inactiveIncomeCategories, inactiveExpenseCategories, loading, refresh } = useCategories(isLoaded, user, { includeInactive: true })

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, category: Category | null }>({ open: false, category: null })
  const [showInactive, setShowInactive] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Filtrar categorías por búsqueda
  const filteredCategories = useMemo(() => {
    const filterBySearch = (categories: Category[]) => {
      if (!searchTerm.trim()) return categories
      return categories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return {
      activeIncome: filterBySearch(incomeCategories),
      activeExpense: filterBySearch(expenseCategories),
      inactiveIncome: filterBySearch(inactiveIncomeCategories),
      inactiveExpense: filterBySearch(inactiveExpenseCategories)
    }
  }, [incomeCategories, expenseCategories, inactiveIncomeCategories, inactiveExpenseCategories, searchTerm])

  const allCounts = useMemo(() => ({
    income: filteredCategories.activeIncome.length + (showInactive ? filteredCategories.inactiveIncome.length : 0),
    expense: filteredCategories.activeExpense.length + (showInactive ? filteredCategories.inactiveExpense.length : 0),
    inactiveIncome: inactiveIncomeCategories.length,
    inactiveExpense: inactiveExpenseCategories.length
  }), [filteredCategories, showInactive, inactiveIncomeCategories, inactiveExpenseCategories])

  if (!isLoaded) return <LoadingState message="Cargando perfil" />
  if (!user) return <LoadingState message="Error de autenticación" showRetry onRetry={() => window.location.reload()} />
  if (!isInitialized) return <LoadingState message="Preparando tu cuenta" showRetry onRetry={() => window.location.reload()} />

  const handleDelete = async (category: Category) => {
    try {
      const res = await fetch(`/api/categories/${category.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'No se pudo desactivar la categoría')
      }
      const payload = await res.json().catch(() => ({}))
      if (payload?.wasInUse) {
        toast.success('Categoría desactivada (estaba en uso)')
      } else {
        toast.success('Categoría desactivada')
      }
      await refresh()
    } catch (e) {
      console.error(e)
      toast.error(e instanceof Error ? e.message : 'Error al desactivar')
    } finally {
      setConfirmDelete({ open: false, category: null })
    }
  }

  const handleReactivate = async (category: Category) => {
    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: true })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'No se pudo reactivar la categoría')
      }
      toast.success('Categoría reactivada')
      await refresh()
    } catch (e) {
      console.error(e)
      toast.error(e instanceof Error ? e.message : 'Error al reactivar')
    }
  }

  const CategoryGrid = ({ items, inactive = false }: { items: Category[], inactive?: boolean }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((c) => (
        <div key={c.id} className={`flex items-center justify-between rounded-lg border bg-card p-3 ${inactive ? 'opacity-60 border-dashed' : 'border-border'}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-base border" style={{ backgroundColor: inactive ? '#6b7280' : c.color }}>
              <span className="select-none">{c.icon}</span>
            </div>
            <div className="min-w-0">
              <div className={`text-sm font-medium truncate ${inactive ? 'text-muted-foreground' : 'text-foreground'}`}>
                {c.name} {inactive && '(Inactiva)'}
              </div>
              <div className="text-xs text-muted-foreground">{c.type === 'income' ? 'Ingreso' : 'Gasto'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {inactive ? (
              <Button variant="outline" size="icon" title="Reactivar" onClick={() => handleReactivate(c)}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="outline" size="icon" title="Editar" onClick={() => setEditing(c)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" title="Desactivar" onClick={() => setConfirmDelete({ open: true, category: c })}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Perfil</h1>
          <p className="text-sm text-muted-foreground">Gestioná tus categorías personales</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nueva categoría
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Mis Categorías</CardTitle>
          <div className="flex items-center gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            {/* Mostrar inactivas */}
            {(allCounts.inactiveIncome > 0 || allCounts.inactiveExpense > 0) && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-inactive"
                  checked={showInactive}
                  onCheckedChange={(checked) => setShowInactive(checked === true)}
                />
                <label htmlFor="show-inactive" className="text-sm font-medium">
                  Mostrar inactivas ({allCounts.inactiveIncome + allCounts.inactiveExpense})
                </label>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="expense">
            <TabsList>
              <TabsTrigger value="expense">Gastos ({allCounts.expense})</TabsTrigger>
              <TabsTrigger value="income">Ingresos ({allCounts.income})</TabsTrigger>
            </TabsList>
            <TabsContent value="expense">
              {loading ? (
                <div className="py-10"><LoadingState message="Cargando categorías" /></div>
              ) : (
                <div className="space-y-6">
                  {/* Categorías activas */}
                  {filteredCategories.activeExpense.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      {searchTerm ? 'No se encontraron categorías activas' : 'Aún no tienes categorías de gastos'}
                    </div>
                  ) : (
                    <CategoryGrid items={filteredCategories.activeExpense} />
                  )}
                  
                  {/* Categorías inactivas */}
                  {showInactive && filteredCategories.inactiveExpense.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground">Categorías Inactivas</h3>
                      <CategoryGrid items={filteredCategories.inactiveExpense} inactive />
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            <TabsContent value="income">
              {loading ? (
                <div className="py-10"><LoadingState message="Cargando categorías" /></div>
              ) : (
                <div className="space-y-6">
                  {/* Categorías activas */}
                  {filteredCategories.activeIncome.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      {searchTerm ? 'No se encontraron categorías activas' : 'Aún no tienes categorías de ingresos'}
                    </div>
                  ) : (
                    <CategoryGrid items={filteredCategories.activeIncome} />
                  )}
                  
                  {/* Categorías inactivas */}
                  {showInactive && filteredCategories.inactiveIncome.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground">Categorías Inactivas</h3>
                      <CategoryGrid items={filteredCategories.inactiveIncome} inactive />
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Crear */}
      <CategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => { toast.success('Categoría creada'); refresh() }}
        defaultType="expense"
      />

      {/* Editar */}
      <EditCategoryModal
        isOpen={!!editing}
        category={editing}
        onClose={() => setEditing(null)}
        onSaved={() => refresh()}
      />

      {/* Confirmar desactivación */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Desactivar categoría"
        description="La categoría se desactivará y no aparecerá en los formularios. Podrás reactivarla más tarde."
        confirmText="Desactivar"
        cancelText="Cancelar"
        onConfirm={() => confirmDelete.category && handleDelete(confirmDelete.category)}
        onCancel={() => setConfirmDelete({ open: false, category: null })}
      />
    </div>
  )
}

