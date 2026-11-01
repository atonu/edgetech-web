'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Camera, HardDrive, Monitor, Cable, Power, Battery, X, Search, Check, Zap, Plus, Minus, Network, Boxes } from 'lucide-react';
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
  { key: 'power-backup', label: 'Power Backup', icon: Battery, color: '#84cc16' },
  { key: 'networking', label: 'Networking', icon: Network, color: '#3b82f6' },
  { key: 'accessories', label: 'Accessories', icon: Boxes, color: '#f97316' },
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
  onAdd: (sectionKey: string, product: ProductListDto) => void;
}

// Shared device-selection grid + product-picker modal used by both the storefront
// "Build Your Solution" page and the admin package editor.
export default function SolutionBuilder({ productsByBase, loading, selectedProducts, onSelect, onClear, onAdd }: SolutionBuilderProps) {
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [slotSearch, setSlotSearch] = useState('');
  const [activeSubcategory, setActiveSubcategory] = useState('');
  const [quantityDrafts, setQuantityDrafts] = useState<Record<string, string>>({});
  const quantityTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => () => {
    quantityTimers.current.forEach(timer => clearTimeout(timer));
  }, []);

  const applyQuantity = (
    sectionKey: string,
    product: ProductListDto,
    keys: string[],
    currentCount: number,
    nextCount: number
  ) => {
    if (nextCount < currentCount) {
      keys.slice(0, currentCount - nextCount).forEach(onClear);
    } else {
      for (let i = currentCount; i < nextCount; i++) onAdd(sectionKey, product);
    }
  };

  const groupSectionProducts = (sectionKey: string) => {
    const grouped = new Map<number, { product: ProductListDto; count: number; keys: string[] }>();

    Object.entries(selectedProducts)
      .filter(([slotKey]) => slotKey.startsWith(`${sectionKey}_`))
      .forEach(([slotKey, product]) => {
        const existing = grouped.get(product.id);
        if (existing) {
          existing.count += 1;
          existing.keys.push(slotKey);
          return;
        }

        grouped.set(product.id, { product, count: 1, keys: [slotKey] });
      });

    return Array.from(grouped.values());
  };

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

  const activeSectionKey = activeSlotDef?.key.split('_')[0];
  const showSubcategoryFilter = activeSectionKey === 'accessories' || activeSectionKey === 'networking';
  const subcategoryOptions = useMemo(() => {
    const options = new Map<string, string>();
    for (const product of slotProducts) {
      if (product.categorySlug && product.categorySlug !== activeSectionKey) {
        options.set(product.categorySlug, product.categoryName);
      }
    }
    return Array.from(options, ([slug, name]) => ({ slug, name }));
  }, [slotProducts, activeSectionKey]);
  const filteredSlotProducts = slotProducts.filter(product =>
    product.name.toLowerCase().includes(slotSearch.toLowerCase()) &&
    (!activeSubcategory || product.categorySlug === activeSubcategory)
  );

  const closeModal = () => {
    setActiveSlot(null);
    setSlotSearch('');
    setActiveSubcategory('');
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
          const filledProducts = groupSectionProducts(section.key);

          return (
            <div key={section.key} className={styles.sectionRow}>
              <div className={styles.sectionHeaderCol}>
                <span className={styles.sectionRowLabel}>{section.label}</span>
              </div>
              <div className={styles.sectionCardsCol}>
                {filledProducts.map(({ product, count, keys }, cardIdx) => (
                  <motion.div key={`${section.key}-${product.id}`} className={`${styles.slotCard} ${styles.slotFilled}`}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: cardIdx * 0.03 }}>
                    <div className={styles.slotHeader}>
                      <div className={styles.slotIcon} style={{ background: `${section.color}15`, color: section.color }}>
                        <section.icon size={18} />
                      </div>
                      <span className={styles.slotLabel}>{count > 1 ? `${section.label} (${count})` : section.label}</span>
                      <div className={styles.quantityControl} role="group" aria-label={`${product.name} quantity`}>
                        <button type="button" className={styles.quantityButton} aria-label={`Remove one ${product.name}`} onClick={() => {
                          const key = `${section.key}-${product.id}`;
                          const timer = quantityTimers.current.get(key);
                          if (timer) clearTimeout(timer);
                          quantityTimers.current.delete(key);
                          const draft = quantityDrafts[key];
                          const baseCount = draft && Number.isInteger(Number(draft)) && Number(draft) > 0 ? Number(draft) : count;
                          applyQuantity(section.key, product, keys, count, Math.max(0, baseCount - 1));
                          setQuantityDrafts(drafts => {
                            const next = { ...drafts };
                            delete next[key];
                            return next;
                          });
                        }}>
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          className={styles.quantityInput}
                          aria-label={`${product.name} quantity`}
                          value={quantityDrafts[`${section.key}-${product.id}`] ?? count}
                          onFocus={() => setQuantityDrafts(drafts => ({ ...drafts, [`${section.key}-${product.id}`]: String(count) }))}
                          onChange={event => {
                            const key = `${section.key}-${product.id}`;
                            const value = event.target.value;
                            setQuantityDrafts(drafts => ({ ...drafts, [key]: value }));

                            const timer = quantityTimers.current.get(key);
                            if (timer) clearTimeout(timer);

                            const nextCount = Number(value);
                            if (value !== '' && Number.isInteger(nextCount) && nextCount >= 1) {
                              quantityTimers.current.set(key, setTimeout(() => {
                                applyQuantity(section.key, product, keys, count, nextCount);
                                quantityTimers.current.delete(key);
                              }, 250));
                            }
                          }}
                          onBlur={event => {
                            const key = `${section.key}-${product.id}`;
                            const timer = quantityTimers.current.get(key);
                            if (timer) clearTimeout(timer);
                            quantityTimers.current.delete(key);
                            const parsed = Number(event.currentTarget.value);
                            const nextCount = Number.isInteger(parsed) && parsed >= 1 ? parsed : count;
                            applyQuantity(section.key, product, keys, count, nextCount);
                            setQuantityDrafts(drafts => {
                              const next = { ...drafts };
                              delete next[key];
                              return next;
                            });
                          }}
                        />
                        <button type="button" className={styles.quantityButton} aria-label={`Add one ${product.name}`} onClick={() => {
                          const key = `${section.key}-${product.id}`;
                          const timer = quantityTimers.current.get(key);
                          if (timer) clearTimeout(timer);
                          quantityTimers.current.delete(key);
                          const draft = quantityDrafts[key];
                          const baseCount = draft && Number.isInteger(Number(draft)) && Number(draft) > 0 ? Number(draft) : count;
                          applyQuantity(section.key, product, keys, count, baseCount + 1);
                          setQuantityDrafts(drafts => {
                            const next = { ...drafts };
                            delete next[key];
                            return next;
                          });
                        }}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <div className={styles.selectedProduct}>
                      <span className={styles.selectedName}>{product.name}</span>
                      <span className={styles.selectedCount}>Total {count} selected</span>
                      <span className={styles.selectedPrice}>৳{((product.discountPrice ?? product.price) * count).toLocaleString()}</span>
                      <span className={styles.selectedBrand}>{product.brandName}</span>
                    </div>
                  </motion.div>
                ))}

                <motion.button type="button" key={`add-${section.key}`} className={styles.addCard}
                  onClick={() => {
                    const newUniqueId = Math.random().toString(36).substring(2, 9);
                    setActiveSlot(`${section.key}_${newUniqueId}`);
                    setSlotSearch('');
                    setActiveSubcategory('');
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

      {typeof document !== 'undefined' && createPortal(
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
                {showSubcategoryFilter && subcategoryOptions.length > 0 && (
                  <div className={styles.subcategoryFilters} aria-label="Filter by subcategory">
                    <button
                      type="button"
                      className={`${styles.subcategoryChip} ${activeSubcategory === '' ? styles.subcategoryChipActive : ''}`}
                      onClick={() => setActiveSubcategory('')}
                    >
                      All
                    </button>
                    {subcategoryOptions.map(option => (
                      <button
                        type="button"
                        key={option.slug}
                        className={`${styles.subcategoryChip} ${activeSubcategory === option.slug ? styles.subcategoryChipActive : ''}`}
                        onClick={() => setActiveSubcategory(activeSubcategory === option.slug ? '' : option.slug)}
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                )}
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
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
