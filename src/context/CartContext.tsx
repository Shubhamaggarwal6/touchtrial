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
  experienceDeposit: number;
  totalAmount: number;
  itemCount: number;
  basePhones: number;
  extraPhoneCharge: number;
}

const BASE_DEPOSIT = 499;
const BASE_PHONE_LIMIT = 6;
const EXTRA_PHONE_CHARGE = 69;

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

  const extraPhones = Math.max(0, items.length - BASE_PHONE_LIMIT);
  const extraPhoneCharge = extraPhones * EXTRA_PHONE_CHARGE;
  const experienceDeposit = items.length > 0 ? BASE_DEPOSIT + extraPhoneCharge : 0;
  const totalAmount = experienceDeposit;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        experienceDeposit,
        totalAmount,
        itemCount: items.length,
        basePhones: BASE_PHONE_LIMIT,
        extraPhoneCharge,
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
