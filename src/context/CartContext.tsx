import React, { createContext, useContext, useState, useCallback } from 'react';
import { Phone } from '@/data/phones';
import { supabase } from '@/integrations/supabase/client';

interface CartItem {
  phone: Phone;
  selectedVariant: string;
  selectedColor: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (phone: Phone, variant?: string, color?: string) => void;
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
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  homeExperienceDeposit: number;
  convenienceFee: number;
}

const HOME_EXPERIENCE_DEPOSIT = 399;
const CONVENIENCE_FEE = 100;
const BASE_PHONE_LIMIT = 5;
const EXTRA_PHONE_CHARGE = 69;

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  const addToCart = useCallback((phone: Phone, variant?: string, color?: string) => {
    setItems(prev => {
      if (prev.some(item => item.phone.id === phone.id)) {
        // Update variant/color if already in cart
        return prev.map(item =>
          item.phone.id === phone.id
            ? { ...item, selectedVariant: variant || item.selectedVariant, selectedColor: color || item.selectedColor }
            : item
        );
      }
      return [...prev, { phone, selectedVariant: variant || `${phone.variants[0]?.ram} / ${phone.variants[0]?.storage}`, selectedColor: color || phone.colors[0]?.name || '' }];
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

  const applyCoupon = useCallback(async (code: string): Promise<boolean> => {
    const upperCode = code.toUpperCase();
    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', upperCode)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !coupon) return false;
      if (coupon.current_uses >= coupon.max_uses) return false;

      // If first_order_only, check if user has previous bookings
      if (coupon.first_order_only) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { count } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          if (count && count > 0) return false;
        }
      }

      setCouponCode(upperCode);
      setCouponDiscount(coupon.discount_amount);
      return true;
    } catch {
      return false;
    }
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
