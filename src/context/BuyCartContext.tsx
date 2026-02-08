import React, { createContext, useContext, useState, useCallback } from 'react';
import { Phone } from '@/data/phones';

interface BuyCartItem {
  phone: Phone;
  quantity: number;
}

interface BuyCartContextType {
  items: BuyCartItem[];
  addToCart: (phone: Phone) => void;
  removeFromCart: (phoneId: string) => void;
  updateQuantity: (phoneId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (phoneId: string) => boolean;
  totalAmount: number;
  itemCount: number;
}

const BuyCartContext = createContext<BuyCartContextType | undefined>(undefined);

export function BuyCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BuyCartItem[]>([]);

  const addToCart = useCallback((phone: Phone) => {
    setItems(prev => {
      const existing = prev.find(item => item.phone.id === phone.id);
      if (existing) {
        return prev.map(item =>
          item.phone.id === phone.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { phone, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((phoneId: string) => {
    setItems(prev => prev.filter(item => item.phone.id !== phoneId));
  }, []);

  const updateQuantity = useCallback((phoneId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(item => item.phone.id !== phoneId));
    } else {
      setItems(prev =>
        prev.map(item =>
          item.phone.id === phoneId ? { ...item, quantity } : item
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback((phoneId: string) => {
    return items.some(item => item.phone.id === phoneId);
  }, [items]);

  const totalAmount = items.reduce(
    (sum, item) => sum + item.phone.price * item.quantity,
    0
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <BuyCartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        totalAmount,
        itemCount,
      }}
    >
      {children}
    </BuyCartContext.Provider>
  );
}

export function useBuyCart() {
  const context = useContext(BuyCartContext);
  if (context === undefined) {
    throw new Error('useBuyCart must be used within a BuyCartProvider');
  }
  return context;
}
