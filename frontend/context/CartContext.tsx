"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type PrintSides = "front" | "both";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;          // Front design image
  backImage?: string;     // Back design image (T-shirts only)
  quantity: number;
  designJson?: string;
  backDesignJson?: string;
  color?: string;
  printSides?: PrintSides; // "front" | "both"
  size?: string;
  variantName?: string;
  printingCharge?: number; // Extra fee from the selected design template (priceAdjustment)
  soldIndividually?: boolean; // Restrict quantity to 1
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  total: number;
  cartItemsCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  clearCart: () => void;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('amol_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('amol_cart', JSON.stringify(cart));
      } catch (e) {
        console.error("Failed to save cart to localStorage (likely quota exceeded)", e);
        if (e && (e as any).name === 'QuotaExceededError') {
          // MAP ERROR TO FRONTEND UI
          alert("Your cart storage is full! Please complete your checkout or remove some high-resolution items before adding more.");
        }
      }
    }
  }, [cart, isLoaded]);

  const addToCart = (item: CartItem & { soldIndividually?: boolean }) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) =>
        i.productId === item.productId &&
        i.designJson === item.designJson &&
        i.color === item.color &&
        i.size === item.size &&
        i.variantName === item.variantName
      );
      if (existingIndex > -1) {
        // If sold individually, don't increase quantity
        if (item.soldIndividually) return prev;
        
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }
      return [...prev, { ...item, quantity: item.soldIndividually ? 1 : item.quantity }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    setCart((prev) => prev.map((i) => {
      if (i.id === id) {
        if (i.soldIndividually) return { ...i, quantity: 1 };
        return { ...i, quantity: Math.max(1, qty) };
      }
      return i;
    }));
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateQuantity, 
      total, cartItemsCount, isOpen, setIsOpen, clearCart, isLoaded
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
