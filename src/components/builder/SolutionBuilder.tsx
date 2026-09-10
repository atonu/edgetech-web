'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Camera, HardDrive, Monitor, Cable, Power, Battery, X, Search, Check, Zap, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductListDto, PackageSlotWithProducts } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUrl';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './SolutionBuilder.module.css';

export interface SectionDef {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

// One row per real package-builder slot type the API knows about (camera_1..4 collapse into one "camera" row).
export const sections: SectionDef[] = [
  { key: 'camera', label: 'Camera', icon: Camera, color: '#00c8e0' },
  { key: 'dvr', label: 'DVR / NVR', icon: HardDrive, color: '#f5a623' },
  { key: 'monitor', label: 'Monitor', icon: Monitor, color: '#a855f7' },
  { key: 'storage', label: 'Storage', icon: HardDrive, color: '#ef4444' },
  { key: 'cable', label: 'Cable', icon: Cable, color: '#3b82f6' },
  { key: 'power', label: 'Power Adapter', icon: Power, color: '#f59e0b' },
  { key: 'ups', label: 'UPS', icon: Battery, color: '#84cc16' },
];

// Collapses the API's slot payload into a lookup of products keyed by their base slot type.
export function buildProductsByBase(slots: PackageSlotWithProducts[]): Record<string, ProductListDto[]> {
  const byBase: Record<string, Map<number, ProductListDto>> = {};
  for (const { slot, products } of slots) {
    const base = slot.slotKey.split('_')[0];
    const bucket = byBase[base] ?? (byBase[base] = new Map());
    for (const p of products) bucket.set(p.id, p);
  }
  return Object.fromEntries(Object.entries(byBase).map(([k, v]) => [k, [...v.values()]]));
}

interface SolutionBuilderProps {
  productsByBase: Record<string, ProductListDto[]>;
  loading: boolean;
  selectedProducts: Record<string, ProductListDto>;
  onSelect: (slotKey: string, product: ProductListDto) => void;
  onClear: (slotKey: string) => void;
}

// Shared device-selection grid + product-picker modal used by both the storefront
// "Build Your Solution" page and the admin package editor.
export default function SolutionBuilder({ productsByBase, loading, selectedProducts, onSelect, onClear }: SolutionBuilderProps) {
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [slotSearch, setSlotSearch] = useState('');

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

  const closeModal = () => {
    setActiveSlot(null);
    setSlotSearch('');
  };

  const selectProduct = (product: ProductListDto) => {
    if (activeSlot) {
      onSelect(activeSlot, product);
      closeModal();
    }
  };

  if (loading) {
    return (
      <div className={styles.sectionsContainer}>
        {sections.slice(0, 5).map((s) => (
          <div key={`skel-row-${s.key}`} className={styles.sectionRow}>
            <div className={styles.sectionHeaderCol}>
              <Skeleton width="90px" height="1.2rem" />
            </div>
            <div className={styles.sectionCardsCol}>
              <Skeleton width="180px" height="110px" radius="var(--radius-md)" />
              <Skeleton width="180px" height="110px" radius="var(--radius-md)" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className={styles.sectionsContainer}>
        {sections.map((section) => {
          const filledProducts = Object.entries(selectedProducts)
            .filter(([key]) => key.startsWith(`${section.key}_`))
            .map(([key, product]) => ({ key, product }));

          return (
            <div key={section.key} className={styles.sectionRow}>
              <div className={styles.sectionHeaderCol}>
                <span className={styles.sectionRowLabel}>{section.label}</span>
              </div>
              <div className={styles.sectionCardsCol}>
                {filledProducts.map(({ key, product }, cardIdx) => (
                  <motion.div key={key} className={`${styles.slotCard} ${styles.slotFilled}`}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: cardIdx * 0.03 }}>
                    <div className={styles.slotHeader}>
                      <div className={styles.slotIcon} style={{ background: `${section.color}15`, color: section.color }}>
                        <section.icon size={18} />
                      </div>
                      <span className={styles.slotLabel}>{`${section.label} ${cardIdx + 1}`}</span>
                      <button type="button" className={styles.clearSlotBtn} onClick={() => onClear(key)}>
                        <X size={14} />
                      </button>
                    </div>
                    <div className={styles.selectedProduct}>
                      <span className={styles.selectedName}>{product.name}</span>
                      <span className={styles.selectedPrice}>৳{(product.discountPrice ?? product.price).toLocaleString()}</span>
                      <span className={styles.selectedBrand}>{product.brandName}</span>
                    </div>
                  </motion.div>
                ))}

                <motion.button type="button" key={`add-${section.key}`} className={styles.addCard}
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

      <AnimatePresence>
        {activeSlot && (
          <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeModal}>
            <motion.div className={styles.modal} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Select {activeSlotDef?.label}</h3>
                <button type="button" className={styles.modalClose} onClick={closeModal}><X size={20} /></button>
              </div>
              <div className={styles.modalSearch}>
                <Search size={16} />
                <input type="text" placeholder={`Search ${activeSlotDef?.label} products...`}
                  value={slotSearch} onChange={e => setSlotSearch(e.target.value)} autoFocus />
              </div>
              <div className={styles.modalProducts}>
                {filteredSlotProducts.length === 0 ? (
                  <div className={styles.noProducts}>No products found</div>
                ) : (
                  filteredSlotProducts.map(product => {
                    const isSelected = selectedProducts[activeSlot]?.id === product.id;
                    return (
                      <button type="button" key={product.id} className={`${styles.productOption} ${isSelected ? styles.productSelected : ''}`}
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
    </>
  );
}
