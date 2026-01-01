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
  convenienceFee: number;
  totalAmount: number;
  itemCount: number;
}

const EXPERIENCE_FEE_PER_PHONE = 50;
const CONVENIENCE_FEE = 100;

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((phone: Phone) => {
    setItems(prev => {
      if (prev.some(item => item.phone.id === phone.id)) {
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

  const experienceFee = items.length * EXPERIENCE_FEE_PER_PHONE;
  const convenienceFee = items.length > 0 ? CONVENIENCE_FEE : 0;
  const totalAmount = experienceFee + convenienceFee;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        experienceFee,
        convenienceFee,
        totalAmount,
        itemCount: items.length,
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
