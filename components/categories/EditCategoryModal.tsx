'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading'
import { toast } from 'sonner'
import type { Category } from '@/types/database'

interface EditCategoryModalProps {
  isOpen: boolean
  category: Category | null
  onClose: () => void
  onSaved: (updated: Category) => void
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

export default function EditCategoryModal({ isOpen, category, onClose, onSaved }: EditCategoryModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [icon, setIcon] = useState('')
  const [color, setColor] = useState('#6366F1')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (category) {
      setName(category.name)
      setType(category.type)
      setIcon(category.icon)
      setColor(category.color)
    }
  }, [category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category) return
    
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error('El nombre es requerido')
      return
    }
    if (trimmedName.length > 50) {
      toast.error('El nombre no puede exceder 50 caracteres')
      return
    }
    if (!icon.trim()) {
      toast.error('El icono es requerido')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: trimmedName, 
          type, 
          icon: icon.trim() || '📦', 
          color 
        })
      })
      
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        if (res.status === 409) {
          toast.error('Ya existe una categoría con este nombre para este tipo')
        } else {
          throw new Error(err?.error || 'Error al actualizar la categoría')
        }
        return
      }
      
      const updated = await res.json()
      toast.success('Categoría actualizada')
      onSaved(updated)
      onClose()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !category) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-foreground">Editar Categoría</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre *</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v: 'income' | 'expense') => setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">💸 Gasto</SelectItem>
                <SelectItem value="income">💰 Ingreso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Icono</Label>
            <div className="space-y-2">
              <div className="grid grid-cols-6 gap-2">
                {DEFAULT_ICONS[type].map((i) => (
                  <Button key={i} type="button" variant={icon === i ? 'default' : 'outline'} size="sm" onClick={() => setIcon(i)} className="aspect-square">{i}</Button>
                ))}
              </div>
              <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="O escribe tu propio emoji..." maxLength={2} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="space-y-2">
              <div className="grid grid-cols-9 gap-1">
                {DEFAULT_COLORS.map((c) => (
                  <button key={c} type="button" className={`w-6 h-6 rounded border-2 ${color === c ? 'border-foreground' : 'border-border'}`} style={{ backgroundColor: c }} onClick={() => setColor(c)} />
                ))}
              </div>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-8 rounded border border-border" />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={loading}>{loading ? (<><LoadingSpinner size="sm" className="mr-2" />Guardando...</>) : 'Guardar'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

