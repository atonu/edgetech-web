// src/store/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductListDto } from '@/lib/api';
import { itemFromCartItem, itemFromProduct, trackAddToCart, trackRemoveFromCart } from '@/lib/gtm';

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  imageUrl?: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  /** `source` is only for analytics attribution (product_card | product_detail | package_builder). */
  addItem: (product: ProductListDto, quantity?: number, source?: string) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product, quantity = 1, source = 'unknown') => {
        trackAddToCart([itemFromProduct(product, quantity)], source);
        const existing = get().items.find(i => i.productId === product.id);
        if (existing) {
          set(s => ({ items: s.items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i) }));
        } else {
          set(s => ({
            items: [...s.items, {
              id: Date.now(), productId: product.id, productName: product.name,
              imageUrl: product.primaryImageUrl, price: product.price,
              discountPrice: product.discountPrice, quantity, stock: product.stock
            }]
          }));
        }
        set({ isOpen: true });
      },
      removeItem: (productId) => {
        const removed = get().items.find(i => i.productId === productId);
        if (removed) trackRemoveFromCart([itemFromCartItem(removed)]);
        set(s => ({ items: s.items.filter(i => i.productId !== productId) }));
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) { get().removeItem(productId); return; }
        const current = get().items.find(i => i.productId === productId);
        // Report the delta, not the new total — GA4 counts quantity added/removed.
        if (current && quantity !== current.quantity) {
          const delta = quantity - current.quantity;
          if (delta > 0) trackAddToCart([itemFromCartItem(current, delta)], 'quantity_stepper');
          else trackRemoveFromCart([itemFromCartItem(current, -delta)]);
        }
        set(s => ({ items: s.items.map(i => i.productId === productId ? { ...i, quantity } : i) }));
      },
      clearCart: () => set({ items: [] }),
      toggleCart: () => set(s => ({ isOpen: !s.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      total: () => get().items.reduce((sum, i) => sum + (i.discountPrice ?? i.price) * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'et-cart', partialize: (s) => ({ items: s.items }) }
  )
);
