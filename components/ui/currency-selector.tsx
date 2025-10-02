'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getCurrencySymbol, getCurrencyName } from '@/lib/utils/currency';
import { Currency } from '@/types/database';

interface CurrencySelectorProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export function CurrencySelector({ className, variant = 'default' }: CurrencySelectorProps) {
  const { currentCurrency, setCurrency, availableCurrencies } = useCurrency();

  if (variant === 'compact') {
    return (
      <div className={className} title="Moneda preferida para nuevas transacciones">
        <Select value={currentCurrency} onValueChange={(value: Currency) => setCurrency(value)}>
          <SelectTrigger className="w-20 h-8 text-xs">
            <SelectValue>
              <Badge variant="secondary" className="text-xs font-medium">
                {currentCurrency}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {availableCurrencies.map((currency) => (
              <SelectItem key={currency} value={currency} className="text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{currency}</span>
                  <span className="text-muted-foreground">{getCurrencySymbol(currency)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className={className} title="Moneda preferida para nuevas transacciones">
      <Select value={currentCurrency} onValueChange={(value: Currency) => setCurrency(value)}>
        <SelectTrigger className="w-36">
          <SelectValue>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{currentCurrency}</Badge>
              <span className="text-sm">{getCurrencySymbol(currentCurrency)}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableCurrencies.map((currency) => (
            <SelectItem key={currency} value={currency}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{currency}</Badge>
                  <span>{getCurrencyName(currency)}</span>
                </div>
                <span className="text-muted-foreground ml-2">
                  {getCurrencySymbol(currency)}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}