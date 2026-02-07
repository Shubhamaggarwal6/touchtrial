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
  couponCode: string;
  couponDiscount: number;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  homeExperienceDeposit: number;
  convenienceFee: number;
}

const HOME_EXPERIENCE_DEPOSIT = 400;
const CONVENIENCE_FEE = 99;
const BASE_PHONE_LIMIT = 5;
const EXTRA_PHONE_CHARGE = 69;

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

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
    setCouponCode('');
    setCouponDiscount(0);
  }, []);

  const isInCart = useCallback((phoneId: string) => {
    return items.some(item => item.phone.id === phoneId);
  }, [items]);

  const applyCoupon = useCallback((code: string) => {
    // Simple coupon validation - can be expanded
    const upperCode = code.toUpperCase();
    if (upperCode === 'TRIAL50') {
      setCouponCode(upperCode);
      setCouponDiscount(50);
      return true;
    } else if (upperCode === 'FIRST100') {
      setCouponCode(upperCode);
      setCouponDiscount(100);
      return true;
    }
    return false;
  }, []);

  const removeCoupon = useCallback(() => {
    setCouponCode('');
    setCouponDiscount(0);
  }, []);

  const extraPhones = Math.max(0, items.length - BASE_PHONE_LIMIT);
  const extraPhoneCharge = extraPhones * EXTRA_PHONE_CHARGE;
  const homeExperienceDeposit = items.length > 0 ? HOME_EXPERIENCE_DEPOSIT : 0;
  const convenienceFee = items.length > 0 ? CONVENIENCE_FEE : 0;
  const experienceDeposit = homeExperienceDeposit + convenienceFee + extraPhoneCharge;
  const totalAmount = Math.max(0, experienceDeposit - couponDiscount);

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
        couponCode,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        homeExperienceDeposit,
        convenienceFee,
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
