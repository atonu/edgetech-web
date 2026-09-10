'use client';
import { useState, useMemo, useEffect } from 'react';
import { Package, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { ProductListDto, packageBuilderApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import SolutionBuilder, { sections, buildProductsByBase } from '@/components/builder/SolutionBuilder';
import toast from 'react-hot-toast';
import styles from './builder.module.css';

export default function PackageBuilderPage() {
  const [selectedProducts, setSelectedProducts] = useState<Record<string, ProductListDto>>({});
  const [productsByBase, setProductsByBase] = useState<Record<string, ProductListDto[]>>({});
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    packageBuilderApi.getSlots()
      .then(res => setProductsByBase(buildProductsByBase(res.data)))
      .catch(() => toast.error('Failed to load solution builder products.'))
      .finally(() => setLoading(false));
  }, []);

  const totalPrice = useMemo(() => {
    return Object.values(selectedProducts).reduce((sum, p) => sum + (p.discountPrice ?? p.price), 0);
  }, [selectedProducts]);

  const filledSlots = Object.keys(selectedProducts).length;

  const selectProduct = (slotKey: string, product: ProductListDto) => {
    setSelectedProducts(prev => ({ ...prev, [slotKey]: product }));
  };

  const clearSlot = (slotKey: string) => {
    setSelectedProducts(prev => {
      const next = { ...prev };
      delete next[slotKey];
      return next;
    });
  };

  const handleAddAllToCart = () => {
    Object.values(selectedProducts).forEach(p => addItem(p));
    toast.success(`${filledSlots} items added to cart!`);
  };

  return (
    <div className={styles.builderPage}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <span className="section-label"><Package size={14} /> Solution Builder</span>
            <h1><span className="gradient-text">Build Your Solution</span></h1>
            <p className="text-muted">Select components for each slot to configure your complete security and IT setup.</p>
          </div>
        </div>

        {loading ? (
          <div className={styles.layout}>
            <div>
              <SolutionBuilder productsByBase={{}} loading selectedProducts={{}} onSelect={() => {}} onClear={() => {}} />
            </div>
            <div className={styles.sidebar}>
              <div className={styles.summaryCard}>
                <Skeleton width="60%" height="1.4rem" style={{ marginBottom: 16 }} />
                <Skeleton width="100%" height="2.2rem" style={{ marginBottom: 12 }} />
                <Skeleton width="100%" height="48px" radius="var(--radius-md)" />
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.layout}>
            {/* Slot Grid grouped by Section (shared builder) */}
            <div>
              <SolutionBuilder
                productsByBase={productsByBase}
                loading={false}
                selectedProducts={selectedProducts}
                onSelect={selectProduct}
                onClear={clearSlot}
              />
            </div>

            {/* Summary Sidebar */}
            <div className={styles.sidebar}>
              <div className={styles.summaryCard}>
                <h3><Package size={18} /> Package Summary</h3>
                <div className="divider" style={{ margin: '14px 0' }} />
                <div className={styles.summaryStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{filledSlots}</span>
                    <span className={styles.statLabel}>Components</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{Math.max(sections.length - filledSlots, 0)}</span>
                    <span className={styles.statLabel}>Remaining</span>
                  </div>
                </div>

                {filledSlots > 0 && (
                  <div className={styles.selectedList}>
                    {Object.entries(selectedProducts).map(([key, product]) => {
                      const sectionKey = key.split('_')[0];
                      const section = sections.find(s => s.key === sectionKey);
                      const filledKeys = Object.keys(selectedProducts).filter(k => k.startsWith(`${sectionKey}_`));
                      const itemIndex = filledKeys.indexOf(key);
                      const label = section ? `${section.label} ${itemIndex + 1}` : 'Item';
                      return (
                        <div key={key} className={styles.selectedItem}>
                          <span className={styles.selectedItemSlot}>{label}</span>
                          <span className={styles.selectedItemName}>{product.name}</span>
                          <span className={styles.selectedItemPrice}>৳{(product.discountPrice ?? product.price).toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="divider" style={{ margin: '14px 0' }} />
                <div className={styles.totalRow}>
                  <span>Total</span>
                  <span className={styles.totalPrice}>৳{totalPrice.toLocaleString()}</span>
                </div>

                <div className={styles.sidebarActions}>
                  <button className="btn btn-primary btn-lg w-full" style={{ justifyContent: 'center' }}
                    disabled={filledSlots === 0} onClick={handleAddAllToCart}>
                    <ShoppingCart size={18} /> Add All to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
