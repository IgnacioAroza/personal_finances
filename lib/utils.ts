import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateInput(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0];
}

export const defaultCategories = {
  income: [
    { name: 'Salario', icon: '💼', color: '#10B981' },
    { name: 'Freelance', icon: '💻', color: '#3B82F6' },
    { name: 'Inversiones', icon: '📈', color: '#8B5CF6' },
    { name: 'Otros', icon: '💰', color: '#F59E0B' },
  ],
  expense: [
    { name: 'Alimentación', icon: '🍽️', color: '#EF4444' },
    { name: 'Transporte', icon: '🚗', color: '#F97316' },
    { name: 'Entretenimiento', icon: '🎬', color: '#EC4899' },
    { name: 'Compras', icon: '🛒', color: '#8B5CF6' },
    { name: 'Salud', icon: '🏥', color: '#06B6D4' },
    { name: 'Servicios', icon: '⚡', color: '#84CC16' },
    { name: 'Educación', icon: '📚', color: '#3B82F6' },
    { name: 'Otros', icon: '📦', color: '#6B7280' },
  ],
};
