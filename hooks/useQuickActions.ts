'use client';

import { useState } from 'react';

export type TransactionType = 'income' | 'expense' | null;

export function useQuickActions() {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] = useState<TransactionType>(null);

  const openBottomSheet = () => {
    setIsBottomSheetOpen(true);
    setSelectedTransactionType(null);
  };

  const closeBottomSheet = () => {
    setIsBottomSheetOpen(false);
    setSelectedTransactionType(null);
  };

  const selectTransactionType = (type: TransactionType) => {
    setSelectedTransactionType(type);
  };

  const goBackToSelector = () => {
    setSelectedTransactionType(null);
  };

  return {
    isBottomSheetOpen,
    selectedTransactionType,
    openBottomSheet,
    closeBottomSheet,
    selectTransactionType,
    goBackToSelector
  };
}
