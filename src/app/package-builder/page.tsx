'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Camera, HardDrive, Monitor, Cable, Power, Battery, Package, X, Search, Check, ShoppingCart, Save, ArrowRight, Zap, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { ProductListDto, packageBuilderApi } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUrl';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import styles from './builder.module.css';

interface SectionDef {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

// One row per real package-builder slot type the API knows about (camera_1..4 collapse into one "camera" row).
const sections: SectionDef[] = [
  { key: 'camera', label: 'Camera', icon: Camera, color: '#00c8e0' },
  { key: 'dvr', label: 'DVR / NVR', icon: HardDrive, color: '#f5a623' },
  { key: 'monitor', label: 'Monitor', icon: Monitor, color: '#a855f7' },
  { key: 'storage', label: 'Storage', icon: HardDrive, color: '#ef4444' },
  { key: 'cable', label: 'Cable', icon: Cable, color: '#3b82f6' },
  { key: 'power', label: 'Power Adapter', icon: Power, color: '#f59e0b' },
  { key: 'ups', label: 'UPS', icon: Battery, color: '#84cc16' },
];

export default function PackageBuilderPage() {
  const [selectedProducts, setSelectedProducts] = useState<Record<string, ProductListDto>>({});
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [slotSearch, setSlotSearch] = useState('');
  const [productsByBase, setProductsByBase] = useState<Record<string, ProductListDto[]>>({});
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    packageBuilderApi.getSlots()
      .then(res => {
        const byBase: Record<string, Map<number, ProductListDto>> = {};
        for (const { slot, products } of res.data) {
          const base = slot.slotKey.split('_')[0];
          const bucket = byBase[base] ?? (byBase[base] = new Map());
          for (const p of products) bucket.set(p.id, p);
        }
        setProductsByBase(Object.fromEntries(Object.entries(byBase).map(([k, v]) => [k, [...v.values()]])));
      })
      .catch(() => toast.error('Failed to load package builder products.'))
      .finally(() => setLoading(false));
  }, []);

  const activeSlotDef = useMemo(() => {
    if (!activeSlot) return null;
    const sectionKey = activeSlot.split('_')[0];
    const section = sections.find(s => s.key === sectionKey);
    if (!section) return null;
    return { ...section, key: activeSlot };
  }, [activeSlot]);

  const slotProducts = useMemo(() => {
    if (!activeSlotDef) return [];
    return productsByBase[activeSlotDef.key.split('_')[0]] || [];
  }, [activeSlotDef, productsByBase]);

  const filteredSlotProducts = slotProducts.filter(p => p.name.toLowerCase().includes(slotSearch.toLowerCase()));

  const totalPrice = useMemo(() => {
    return Object.values(selectedProducts).reduce((sum, p) => sum + (p.discountPrice ?? p.price), 0);
  }, [selectedProducts]);

  const filledSlots = Object.keys(selectedProducts).length;

  const selectProduct = (product: ProductListDto) => {
    if (activeSlot) {
      setSelectedProducts(prev => ({ ...prev, [activeSlot]: product }));
      setActiveSlot(null);
      setSlotSearch('');
    }
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
            <span className="section-label"><Package size={14} /> CCTV Package Builder</span>
            <h1>Build Your Custom <span className="gradient-text">Security Package</span></h1>
            <p className="text-muted">Select components for each slot to build your perfect surveillance system.</p>
          </div>
        </div>

        <div className={styles.layout}>
          {/* Slot Grid grouped by Section */}
          <div className={styles.sectionsContainer}>
            {sections.map((section) => {
              // Find filled products for this section
              const filledProducts = Object.entries(selectedProducts)
                .filter(([key]) => key.startsWith(`${section.key}_`))
                .map(([key, product]) => ({ key, product }));

              return (
                <div key={section.key} className={styles.sectionRow}>
                  <div className={styles.sectionHeaderCol}>
                    <span className={styles.sectionRowLabel}>{section.label}</span>
                  </div>
                  <div className={styles.sectionCardsCol}>
                    {/* Render filled slots */}
                    {filledProducts.map(({ key, product }, cardIdx) => {
                      return (
                        <motion.div key={key} className={`${styles.slotCard} ${styles.slotFilled}`}
                          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: cardIdx * 0.03 }}>
                          <div className={styles.slotHeader}>
                            <div className={styles.slotIcon} style={{ background: `${section.color}15`, color: section.color }}>
                              <section.icon size={18} />
                            </div>
                            <span className={styles.slotLabel}>{`${section.label} ${cardIdx + 1}`}</span>
                            <button className={styles.clearSlotBtn} onClick={() => clearSlot(key)}>
                              <X size={14} />
                            </button>
                          </div>
                          <div className={styles.selectedProduct}>
                            <span className={styles.selectedName}>{product.name}</span>
                            <span className={styles.selectedPrice}>৳{(product.discountPrice ?? product.price).toLocaleString()}</span>
                            <span className={styles.selectedBrand}>{product.brandName}</span>
                          </div>
                        </motion.div>
                      );
                    })}

                    {/* Render exactly one Add card at the end of the row */}
                    <motion.button key={`add-${section.key}`} className={styles.addCard}
                      onClick={() => {
                        const newUniqueId = Math.random().toString(36).substring(2, 9);
                        setActiveSlot(`${section.key}_${newUniqueId}`);
                        setSlotSearch('');
                      }}
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}>
                      <Plus size={24} />
                    </motion.button>
                  </div>
                </div>
              );
            })}
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
      </div>

      {/* Product Selection Modal */}
      <AnimatePresence>
        {activeSlot && (
          <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setActiveSlot(null)}>
            <motion.div className={styles.modal} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Select {activeSlotDef?.label}</h3>
                <button className={styles.modalClose} onClick={() => setActiveSlot(null)}><X size={20} /></button>
              </div>
              <div className={styles.modalSearch}>
                <Search size={16} />
                <input type="text" placeholder={`Search ${activeSlotDef?.label} products...`}
                  value={slotSearch} onChange={e => setSlotSearch(e.target.value)} autoFocus />
              </div>
              <div className={styles.modalProducts}>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={`slot-skeleton-${i}`} className={styles.productOption}>
                      <Skeleton width={36} height={36} radius="var(--radius-md)" />
                      <div className={styles.productOptionInfo}>
                        <Skeleton width="70%" height="0.9rem" style={{ marginBottom: 6 }} />
                        <Skeleton width="40%" height="0.75rem" />
                      </div>
                      <Skeleton width="20%" height="0.9rem" />
                    </div>
                  ))
                ) : filteredSlotProducts.length === 0 ? (
                  <div className={styles.noProducts}>No products found</div>
                ) : (
                  filteredSlotProducts.map(product => {
                    const isSelected = selectedProducts[activeSlot]?.id === product.id;
                    return (
                      <button key={product.id} className={`${styles.productOption} ${isSelected ? styles.productSelected : ''}`}
                        onClick={() => selectProduct(product)}>
                        <div className={styles.productOptionIcon}>
                          {product.primaryImageUrl ? (
                            <Image src={getImageUrl(product.primaryImageUrl)!} alt="" fill sizes="48px" style={{ objectFit: 'cover' }} />
                          ) : (
                            <Zap size={18} />
                          )}
                        </div>
                        <div className={styles.productOptionInfo}>
                          <span className={styles.productOptionName}>{product.name}</span>
                          <span className={styles.productOptionBrand}>{product.brandName}</span>
                        </div>
                        <span className={styles.productOptionPrice}>৳{(product.discountPrice ?? product.price).toLocaleString()}</span>
                        {isSelected && <Check size={16} className={styles.checkIcon} />}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
