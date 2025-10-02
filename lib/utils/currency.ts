import { Currency } from '@/types/database';

// Re-exportar Currency para facilitar el uso
export type { Currency } from '@/types/database';

// Configuración de monedas
export const CURRENCIES: Record<Currency, {
  code: Currency;
  symbol: string;
  name: string;
  locale: string;
  decimalPlaces: number;
}> = {
  ARS: {
    code: 'ARS',
    symbol: '$',
    name: 'Peso Argentino',
    locale: 'es-AR',
    decimalPlaces: 2
  },
  USD: {
    code: 'USD',
    symbol: 'US$',
    name: 'Dólar Americano',
    locale: 'en-US',
    decimalPlaces: 2
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'es-ES',
    decimalPlaces: 2
  }
};

// Lista de monedas disponibles
export const AVAILABLE_CURRENCIES: Currency[] = ['ARS', 'USD', 'EUR'];

// Función para formatear cantidad con moneda
export function formatCurrency(amount: number, currency: Currency): string {
  const config = CURRENCIES[currency];
  
  try {
    // Usar Intl.NumberFormat para formateo apropiado
    const formatter = new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: config.decimalPlaces,
      maximumFractionDigits: config.decimalPlaces
    });
    
    return formatter.format(amount);
  } catch {
    // Fallback si el locale no está soportado
    return `${config.symbol}${amount.toFixed(config.decimalPlaces)}`;
  }
}

// Función para obtener solo el símbolo de la moneda
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCIES[currency].symbol;
}

// Función para obtener el nombre de la moneda
export function getCurrencyName(currency: Currency): string {
  return CURRENCIES[currency].name;
}

// Función para validar si una moneda es válida
export function isValidCurrency(currency: string): currency is Currency {
  return AVAILABLE_CURRENCIES.includes(currency as Currency);
}

// Función para obtener la configuración de una moneda
export function getCurrencyConfig(currency: Currency) {
  return CURRENCIES[currency];
}