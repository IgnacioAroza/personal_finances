'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({ selected, onSelect, className = '' }) => {
  const [currentDate, setCurrentDate] = React.useState(selected || new Date());
  
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
  
  const days = [];
  const current = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const isSelected = (date: Date) => {
    if (!selected) return false;
    return date.toDateString() === selected.toDateString();
  };
  
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  return (
    <div className={`p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goToPreviousMonth}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <h3 className="text-sm font-medium">
          {monthNames[month]} {year}
        </h3>
        
        <button
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="text-xs text-gray-500 text-center p-1 font-medium">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => (
          <button
            key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
            onClick={() => onSelect(day)}
            className={`
              text-xs p-1 rounded text-center hover:bg-gray-100 dark:hover:bg-gray-700
              ${!isCurrentMonth(day) ? 'text-gray-400' : 'text-gray-900 dark:text-gray-100'}
              ${isToday(day) ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''}
              ${isSelected(day) ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
            `}
          >
            {day.getDate()}
          </button>
        ))}
      </div>
    </div>
  );
};
