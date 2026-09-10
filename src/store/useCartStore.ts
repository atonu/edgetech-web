// src/store/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductListDto, PackageDto } from '@/lib/api';

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

export interface CartPackageItem {
  productId: number;
  productName: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
}

// A selected bundle template. Billed at packagePrice (not the sum of its items) but its
// component products are what actually ship — the items list is kept for display.
export interface CartPackage {
  packageId: number;
  name: string;
  description?: string;
  regularPrice: number;
  packagePrice: number;
  quantity: number;
  items: CartPackageItem[];
}

interface CartState {
  items: CartItem[];
  packages: CartPackage[];
  isOpen: boolean;
  addItem: (product: ProductListDto, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  addPackage: (pkg: PackageDto, quantity?: number) => void;
  removePackage: (packageId: number) => void;
  updatePackageQuantity: (packageId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  total: () => number;
  count: () => number;
}

const packageUnitCount = (p: CartPackage) => p.items.reduce((sum, i) => sum + i.quantity, 0) * p.quantity;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      packages: [],
      isOpen: false,
      addItem: (product, quantity = 1) => {
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
      removeItem: (productId) => set(s => ({ items: s.items.filter(i => i.productId !== productId) })),
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) { get().removeItem(productId); return; }
        set(s => ({ items: s.items.map(i => i.productId === productId ? { ...i, quantity } : i) }));
      },
      addPackage: (pkg, quantity = 1) => {
        const existing = get().packages.find(p => p.packageId === pkg.id);
        if (existing) {
          set(s => ({ packages: s.packages.map(p => p.packageId === pkg.id ? { ...p, quantity: p.quantity + quantity } : p) }));
        } else {
          set(s => ({
            packages: [...s.packages, {
              packageId: pkg.id,
              name: pkg.name,
              description: pkg.description,
              regularPrice: pkg.regularPrice,
              packagePrice: pkg.packagePrice,
              quantity,
              items: pkg.items.map(i => ({
                productId: i.productId,
                productName: i.productName,
                imageUrl: i.imageUrl,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
              })),
            }]
          }));
        }
        set({ isOpen: true });
      },
      removePackage: (packageId) => set(s => ({ packages: s.packages.filter(p => p.packageId !== packageId) })),
      updatePackageQuantity: (packageId, quantity) => {
        if (quantity <= 0) { get().removePackage(packageId); return; }
        set(s => ({ packages: s.packages.map(p => p.packageId === packageId ? { ...p, quantity } : p) }));
      },
      clearCart: () => set({ items: [], packages: [] }),
      toggleCart: () => set(s => ({ isOpen: !s.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      total: () =>
        get().items.reduce((sum, i) => sum + (i.discountPrice ?? i.price) * i.quantity, 0) +
        get().packages.reduce((sum, p) => sum + p.packagePrice * p.quantity, 0),
      count: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0) +
        get().packages.reduce((sum, p) => sum + packageUnitCount(p), 0),
    }),
    { name: 'et-cart', partialize: (s) => ({ items: s.items, packages: s.packages }) }
  )
);
