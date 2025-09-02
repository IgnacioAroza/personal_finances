'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading'
import { toast } from 'sonner'
import type { Category } from '@/types/database'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newCategory: Category) => void
  defaultType?: 'income' | 'expense'
}

interface CategoryFormData {
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
}

const DEFAULT_ICONS = {
  income: ['💰', '📈', '💼', '🏆', '💎', '🎯'],
  expense: ['🛒', '🏠', '🚗', '🍔', '🎮', '💊', '✈️', '📱']
}

const DEFAULT_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
  '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E'
]

export default function CategoryModal({ isOpen, onClose, onSuccess, defaultType = 'expense' }: CategoryModalProps) {
  const [form, setForm] = useState<CategoryFormData>({
    name: '',
    type: defaultType,
    icon: '',
    color: '#6366F1'
  })
  const [loading, setLoading] = useState(false)

  const updateForm = (field: keyof CategoryFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.name.trim()) {
      toast.error('El nombre de la categoría es requerido')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name.trim(),
          type: form.type,
          icon: form.icon || '📦',
          color: form.color
        })
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 409) {
          toast.error('Ya existe una categoría con ese nombre')
          return
        }
        throw new Error(error.error || 'Error al crear la categoría')
      }

      const { category: newCategory } = await response.json()
      
      if (!newCategory || !newCategory.id) {
        throw new Error('Respuesta inválida del servidor')
      }
      
      toast.success('Categoría creada exitosamente')
      onSuccess(newCategory)
      onClose()
      
      // Reset form
      setForm({
        name: '',
        type: defaultType,
        icon: '',
        color: '#6366F1'
      })
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Error al crear la categoría')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-foreground">Nueva Categoría</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="category-name">Nombre *</Label>
            <Input
              id="category-name"
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              placeholder="Ej: Alimentación, Transporte..."
              required
              disabled={loading}
            />
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="category-type">Tipo</Label>
            <Select value={form.type} onValueChange={(value: 'income' | 'expense') => updateForm('type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">💸 Gasto</SelectItem>
                <SelectItem value="income">💰 Ingreso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Icono */}
          <div className="space-y-2">
            <Label htmlFor="category-icon">Icono</Label>
            <div className="space-y-2">
              <div className="grid grid-cols-6 gap-2">
                {DEFAULT_ICONS[form.type].map((icon) => (
                  <Button
                    key={icon}
                    type="button"
                    variant={form.icon === icon ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateForm('icon', icon)}
                    className="aspect-square"
                  >
                    {icon}
                  </Button>
                ))}
              </div>
              <Input
                value={form.icon}
                onChange={(e) => updateForm('icon', e.target.value)}
                placeholder="O escribe tu propio emoji..."
                maxLength={2}
              />
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="category-color">Color</Label>
            <div className="space-y-2">
              <div className="grid grid-cols-9 gap-1">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-6 h-6 rounded border-2 ${
                      form.color === color ? 'border-foreground' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateForm('color', color)}
                  />
                ))}
              </div>
              <input
                type="color"
                value={form.color}
                onChange={(e) => updateForm('color', e.target.value)}
                className="w-full h-8 rounded border border-border"
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creando...
                </>
              ) : (
                'Crear'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
