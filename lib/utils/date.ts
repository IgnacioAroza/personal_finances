export type Timeframe = 'all' | 'day' | 'week' | 'month'

/**
 * Convierte una fecha a formato YYYY-MM-DD usando hora local
 */
export const toYMD = (d: Date): string => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Inicio del día (misma fecha YMD)
 */
export const startOfDay = (date: Date): Date => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Final del día (misma fecha YMD)
 */
export const endOfDay = (date: Date): Date => {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Inicio de la semana ISO (lunes)
 */
export const startOfISOWeek = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Lunes
  d.setDate(diff)
  return startOfDay(d)
}

/**
 * Final de la semana ISO (domingo)
 */
export const endOfISOWeek = (date: Date): Date => {
  const start = startOfISOWeek(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6) // +6 días para llegar al domingo
  return endOfDay(end)
}

/**
 * Inicio del mes
 */
export const startOfMonth = (date: Date): Date => {
  const d = new Date(date)
  d.setDate(1)
  return startOfDay(d)
}

/**
 * Final del mes
 */
export const endOfMonth = (date: Date): Date => {
  const d = new Date(date)
  d.setMonth(d.getMonth() + 1, 0) // Último día del mes actual
  return endOfDay(d)
}

/**
 * Obtiene el rango de fechas para un timeframe dado
 */
export function getRange(timeframe: Timeframe, referenceDate: Date): { from: string; to: string } | null {
  switch (timeframe) {
    case 'all':
      return null
    
    case 'day': {
      const dayStart = startOfDay(referenceDate)
      const dayEnd = endOfDay(referenceDate)
      return {
        from: toYMD(dayStart),
        to: toYMD(dayEnd)
      }
    }
    
    case 'week': {
      const weekStart = startOfISOWeek(referenceDate)
      const weekEnd = endOfISOWeek(referenceDate)
      return {
        from: toYMD(weekStart),
        to: toYMD(weekEnd)
      }
    }
    
    case 'month': {
      const monthStart = startOfMonth(referenceDate)
      const monthEnd = endOfMonth(referenceDate)
      return {
        from: toYMD(monthStart),
        to: toYMD(monthEnd)
      }
    }
    
    default:
      return null
  }
}
