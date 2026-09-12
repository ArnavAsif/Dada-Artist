'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product, CartItem, LightingMode } from '@/types';
import { sounds } from '@/utils/sound';

interface FlyingProductPayload {
  product: Product;
  startRect: DOMRect;
}

interface ShowroomContextType {
  // Product morph modal state
  selectedProduct: Product | null;
  sourceRect: DOMRect | null;
  isModalOpen: boolean;
  isReversing: boolean;
  openProduct: (product: Product, rect: DOMRect) => void;
  closeProduct: () => void;
  finishCloseModal: () => void;

  // Cart state
  cart: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: Product, quantity?: number, sourceImageEl?: HTMLElement | null) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  totalCartItems: number;
  totalCartAmount: number;

  // Flying product transition state
  flyingProduct: FlyingProductPayload | null;
  clearFlyingProduct: () => void;

  // Navigation menu state
  isMenuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;

  // Showroom environmental controls
  lightingMode: LightingMode;
  setLightingMode: (mode: LightingMode) => void;
  cycleLightingMode: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  hotspotsVisible: boolean;
  toggleHotspotsVisible: () => void;

  // Hovered product for subtle ambient cues
  hoveredProduct: Product | null;
  setHoveredProduct: (product: Product | null) => void;
}

const ShowroomContext = createContext<ShowroomContextType | undefined>(undefined);

export const ShowroomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sourceRect, setSourceRect] = useState<DOMRect | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isReversing, setIsReversing] = useState<boolean>(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [flyingProduct, setFlyingProduct] = useState<FlyingProductPayload | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [lightingMode, setLightingMode] = useState<LightingMode>('warm-day');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false); // muted by default for luxury discretion
  const [hotspotsVisible, setHotspotsVisible] = useState<boolean>(true);
  const [hoveredProduct, setHoveredProduct] = useState<Product | null>(null);

  // Sync sound manager
  useEffect(() => {
    sounds.setEnabled(soundEnabled);
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      sounds.setEnabled(next);
      if (next) sounds.playSelect();
      return next;
    });
  }, []);

  const openProduct = useCallback((product: Product, rect: DOMRect) => {
    sounds.playSelect();
    setSelectedProduct(product);
    setSourceRect(rect);
    setIsReversing(false);
    setIsModalOpen(true);
    // Auto close cart or menu if open
    setIsCartOpen(false);
    setIsMenuOpen(false);
  }, []);

  const closeProduct = useCallback(() => {
    sounds.playClose();
    setIsReversing(true);
  }, []);

  const finishCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setSourceRect(null);
    setIsReversing(false);
  }, []);

  const openCart = useCallback(() => {
    sounds.playSelect();
    setIsCartOpen(true);
    setIsMenuOpen(false);
  }, []);

  const closeCart = useCallback(() => {
    sounds.playClose();
    setIsCartOpen(false);
  }, []);

  const toggleCart = useCallback(() => {
    setIsCartOpen((prev) => {
      if (!prev) sounds.playSelect();
      else sounds.playClose();
      return !prev;
    });
  }, []);

  const clearFlyingProduct = useCallback(() => {
    setFlyingProduct(null);
  }, []);

  const addToCart = useCallback((product: Product, quantity = 1, sourceImageEl?: HTMLElement | null) => {
    sounds.playAddToCart();

    // Trigger flying animation proxy if source image element exists
    if (sourceImageEl) {
      const rect = sourceImageEl.getBoundingClientRect();
      setFlyingProduct({ product, startRect: rect });
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [{ product, quantity, addedAt: Date.now() }, ...prevCart];
    });

    // Automatically slide in cart after brief delay to let flying animation arrive
    setTimeout(() => {
      setIsCartOpen(true);
    }, 450);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    sounds.playClose();
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    sounds.playSelect();
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  }, []);

  const openMenu = useCallback(() => {
    sounds.playSelect();
    setIsMenuOpen(true);
    setIsCartOpen(false);
  }, []);

  const closeMenu = useCallback(() => {
    sounds.playClose();
    setIsMenuOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => {
      if (!prev) sounds.playSelect();
      else sounds.playClose();
      return !prev;
    });
  }, []);

  const cycleLightingMode = useCallback(() => {
    sounds.playSelect();
    setLightingMode((prev) => {
      if (prev === 'warm-day') return 'ambient-evening';
      if (prev === 'ambient-evening') return 'gallery-focus';
      return 'warm-day';
    });
  }, []);

  const toggleHotspotsVisible = useCallback(() => {
    sounds.playSelect();
    setHotspotsVisible((prev) => !prev);
  }, []);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <ShowroomContext.Provider
      value={{
        selectedProduct,
        sourceRect,
        isModalOpen,
        isReversing,
        openProduct,
        closeProduct,
        finishCloseModal,
        cart,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        totalCartItems,
        totalCartAmount,
        flyingProduct,
        clearFlyingProduct,
        isMenuOpen,
        openMenu,
        closeMenu,
        toggleMenu,
        lightingMode,
        setLightingMode,
        cycleLightingMode,
        soundEnabled,
        toggleSound,
        hotspotsVisible,
        toggleHotspotsVisible,
        hoveredProduct,
        setHoveredProduct,
      }}
    >
      {children}
    </ShowroomContext.Provider>
  );
};

export const useShowroom = () => {
  const context = useContext(ShowroomContext);
  if (!context) {
    throw new Error('useShowroom must be used within a ShowroomProvider');
  }
  return context;
};
