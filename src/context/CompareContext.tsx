import { createContext, useContext, useState, ReactNode } from 'react';
import { Phone } from '@/data/phones';

interface CompareContextType {
  compareList: Phone[];
  addToCompare: (phone: Phone) => void;
  removeFromCompare: (phoneId: string) => void;
  isInCompare: (phoneId: string) => boolean;
  clearCompare: () => void;
  compareCount: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<Phone[]>([]);

  const addToCompare = (phone: Phone) => {
    if (compareList.length >= 4) return; // Max 4 phones
    if (!compareList.find(p => p.id === phone.id)) {
      setCompareList(prev => [...prev, phone]);
    }
  };

  const removeFromCompare = (phoneId: string) => {
    setCompareList(prev => prev.filter(p => p.id !== phoneId));
  };

  const isInCompare = (phoneId: string) => {
    return compareList.some(p => p.id === phoneId);
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return (
    <CompareContext.Provider value={{
      compareList,
      addToCompare,
      removeFromCompare,
      isInCompare,
      clearCompare,
      compareCount: compareList.length,
    }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
