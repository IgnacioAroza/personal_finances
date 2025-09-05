'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as Popover from '@radix-ui/react-popover';
import * as Separator from '@radix-ui/react-separator';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Calendar, Clock, X, CalendarDays } from 'lucide-react';
import type { Timeframe } from '@/lib/utils/date';

interface TimeframeFilterProps {
  value: Timeframe;
  onChange: (timeframe: Timeframe) => void;
  referenceDate?: Date;
  onReferenceDateChange?: (date: Date) => void;
  className?: string;
}

const timeframeOptions = [
  { value: 'all' as const, label: 'Todas las fechas', icon: Clock },
  { value: 'day' as const, label: 'Hoy', icon: Calendar },
  { value: 'week' as const, label: 'Esta semana', icon: Calendar },
  { value: 'month' as const, label: 'Este mes', icon: Calendar },
];

export const TimeframeFilter: React.FC<TimeframeFilterProps> = ({
  value,
  onChange,
  referenceDate,
  onReferenceDateChange,
  className = '',
}) => {
  const formatReferenceDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const handleClearFilters = () => {
    onChange('all');
    if (onReferenceDateChange) {
      onReferenceDateChange(new Date());
    }
  };

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {/* Fila principal con controles principales */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4">
        {/* Selector de período */}
        <div className="flex-shrink-0">
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              {timeframeOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Controles de fecha y limpiar (solo cuando hay filtros) */}
        {value !== 'all' && (
          <>
            {/* Separador solo en desktop */}
            <Separator.Root 
              orientation="vertical" 
              className="hidden sm:block h-6 w-px bg-border" 
            />
            
            {/* Contenedor para fecha y limpiar en la misma línea */}
            <div className="flex items-center gap-2 flex-1">
              {/* Selector de fecha de referencia */}
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-muted-foreground hidden sm:inline">Fecha:</span>
                <Popover.Root>
                  <Popover.Trigger asChild>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-full sm:w-auto justify-center sm:justify-start">
                      <CalendarDays className="h-4 w-4" />
                      <span className="truncate">
                        {referenceDate ? formatReferenceDate(referenceDate) : 'Seleccionar'}
                      </span>
                    </button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content 
                      className="z-50" 
                      sideOffset={5}
                      align="start"
                    >
                      <CalendarComponent
                        selected={referenceDate}
                        onSelect={(date) => {
                          if (onReferenceDateChange) {
                            onReferenceDateChange(date);
                          }
                        }}
                      />
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              </div>

              {/* Botón limpiar filtros */}
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 px-3 py-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors border border-border whitespace-nowrap"
                title="Limpiar filtros"
              >
                <X className="h-3 w-3" />
                Limpiar
              </button>
            </div>
          </>
        )}
      </div>

      {/* Indicador de período activo - Fila separada en móvil */}
      {value !== 'all' && referenceDate && (
        <div className="border-t border-border px-3 py-2">
          <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md text-center sm:text-left sm:inline-block">
            {value === 'day' && `Día: ${formatReferenceDate(referenceDate)}`}
            {value === 'week' && `Semana del ${formatReferenceDate(referenceDate)}`}
            {value === 'month' && `Mes: ${referenceDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`}
          </div>
        </div>
      )}
    </div>
  );
};
