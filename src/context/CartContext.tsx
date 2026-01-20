import React, { createContext, useContext, useState, useCallback } from 'react';
import { Phone } from '@/data/phones';

interface CartItem {
  phone: Phone;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (phone: Phone) => void;
  removeFromCart: (phoneId: string) => void;
  clearCart: () => void;
  isInCart: (phoneId: string) => boolean;
  experienceFee: number;
  totalAmount: number;
  itemCount: number;
  maxPhones: number;
  canAddMore: boolean;
}

const FLAT_EXPERIENCE_FEE = 499;
const MAX_PHONES = 6;

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((phone: Phone) => {
    setItems(prev => {
      if (prev.some(item => item.phone.id === phone.id)) {
        return prev;
      }
      if (prev.length >= MAX_PHONES) {
        return prev;
      }
      return [...prev, { phone }];
    });
  }, []);

  const removeFromCart = useCallback((phoneId: string) => {
    setItems(prev => prev.filter(item => item.phone.id !== phoneId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback((phoneId: string) => {
    return items.some(item => item.phone.id === phoneId);
  }, [items]);

  const experienceFee = items.length > 0 ? FLAT_EXPERIENCE_FEE : 0;
  const totalAmount = experienceFee;
  const canAddMore = items.length < MAX_PHONES;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        experienceFee,
        totalAmount,
        itemCount: items.length,
        maxPhones: MAX_PHONES,
        canAddMore,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
