'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Camera, HardDrive, Monitor, Cable, Power, Wifi, Battery, Shield, Package, X, Search, Check, ShoppingCart, Save, ArrowRight, Zap, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { ProductListDto } from '@/lib/api';
import toast from 'react-hot-toast';
import styles from './builder.module.css';

interface SlotDef {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  category: string;
}

const slots: SlotDef[] = [
  { key: 'camera_1', label: 'Camera 1', icon: Camera, color: '#00c8e0', category: 'IP Camera' },
  { key: 'camera_2', label: 'Camera 2', icon: Camera, color: '#00c8e0', category: 'IP Camera' },
  { key: 'camera_3', label: 'Camera 3', icon: Camera, color: '#22c55e', category: 'CC Camera' },
  { key: 'camera_4', label: 'Camera 4', icon: Camera, color: '#22c55e', category: 'CC Camera' },
  { key: 'dvr', label: 'DVR / NVR', icon: HardDrive, color: '#f5a623', category: 'NVR/DVR' },
  { key: 'monitor', label: 'Monitor', icon: Monitor, color: '#a855f7', category: 'Monitor' },
  { key: 'storage', label: 'HDD Storage', icon: HardDrive, color: '#ef4444', category: 'Storage' },
  { key: 'cable', label: 'Network Cable', icon: Cable, color: '#3b82f6', category: 'Cable' },
  { key: 'power', label: 'Power Adapter', icon: Power, color: '#f59e0b', category: 'Accessories' },
  { key: 'switch', label: 'Network Switch', icon: Wifi, color: '#06b6d4', category: 'Networking' },
  { key: 'ups', label: 'UPS', icon: Battery, color: '#84cc16', category: 'UPS' },
  { key: 'bnc', label: 'BNC / Balun', icon: Shield, color: '#e879f9', category: 'Accessories' },
];

interface SectionDef {
  key: string;
  label: string;
  category: string;
  icon: React.ElementType;
  color: string;
}

const sections: SectionDef[] = [
  { key: 'camera', label: 'Camera', category: 'Camera', icon: Camera, color: '#00c8e0' },
  { key: 'dvr', label: 'DVR / NVR', category: 'NVR/DVR', icon: HardDrive, color: '#f5a623' },
  { key: 'monitor', label: 'Monitor', category: 'Monitor', icon: Monitor, color: '#a855f7' },
  { key: 'storage', label: 'Storage', category: 'Storage', icon: HardDrive, color: '#ef4444' },
  { key: 'cable', label: 'Cable', category: 'Cable', icon: Cable, color: '#3b82f6' },
  { key: 'power', label: 'Power Adapter', category: 'Accessories', icon: Power, color: '#f59e0b' },
  { key: 'switch', label: 'Network Switch', category: 'Networking', icon: Wifi, color: '#06b6d4' },
  { key: 'ups', label: 'UPS', category: 'UPS', icon: Battery, color: '#84cc16' },
  { key: 'bnc', label: 'BNC / Balun', category: 'Accessories', icon: Shield, color: '#e879f9' },
];

// Mock products per category
const mockProductsByCategory: Record<string, ProductListDto[]> = {
  'IP Camera': Array.from({ length: 6 }).map((_, i) => ({
    id: 100 + i, name: ['Hikvision 4MP Dome', 'Hikvision 8MP Turret', 'Dahua 4MP Bullet', 'Imou Cruiser 4MP', 'Uniview 2MP Dome', 'Hikvision 2MP Bullet'][i],
    slug: `ip-cam-${i}`, price: [12500, 28000, 9500, 15000, 7800, 6500][i], stock: 20,
    isFeatured: i < 2, categoryName: 'IP Camera', brandName: ['Hikvision', 'Hikvision', 'Dahua', 'Imou', 'Uniview', 'Hikvision'][i],
  })),
  'CC Camera': Array.from({ length: 4 }).map((_, i) => ({
    id: 200 + i, name: ['Dahua 2MP CC Cam', 'Hikvision HD CC Cam', 'Uniview CC Camera', 'Generic 1080P CC'][i],
    slug: `cc-cam-${i}`, price: [4500, 5800, 4200, 3500][i], stock: 15,
    isFeatured: false, categoryName: 'CC Camera', brandName: ['Dahua', 'Hikvision', 'Uniview', 'Generic'][i],
  })),
  'NVR/DVR': Array.from({ length: 4 }).map((_, i) => ({
    id: 300 + i, name: ['Dahua 8CH NVR', 'Hikvision 4CH DVR', 'Dahua 16CH XVR', 'Uniview 8CH NVR'][i],
    slug: `nvr-${i}`, price: [18000, 12000, 25000, 15500][i], stock: 10,
    isFeatured: false, categoryName: 'NVR/DVR', brandName: ['Dahua', 'Hikvision', 'Dahua', 'Uniview'][i],
  })),
  'Monitor': [{ id: 400, name: 'Dell 24" FHD Monitor', slug: 'monitor-1', price: 22000, stock: 8, isFeatured: false, categoryName: 'Monitor', brandName: 'Dell' },
    { id: 401, name: 'Hikvision 22" Monitor', slug: 'monitor-2', price: 16000, stock: 5, isFeatured: false, categoryName: 'Monitor', brandName: 'Hikvision' }],
  'Storage': [{ id: 500, name: 'Seagate 4TB HDD', slug: 'hdd-1', price: 14000, stock: 20, isFeatured: false, categoryName: 'Storage', brandName: 'Seagate' },
    { id: 501, name: 'WD Purple 2TB', slug: 'hdd-2', price: 8500, stock: 15, isFeatured: false, categoryName: 'Storage', brandName: 'WD' }],
  'Cable': [{ id: 600, name: 'Cat6 Cable 305m', slug: 'cable-1', price: 6500, stock: 30, isFeatured: false, categoryName: 'Cable', brandName: 'Generic' },
    { id: 601, name: 'RG59 BNC Cable 305m', slug: 'cable-2', price: 5500, stock: 20, isFeatured: false, categoryName: 'Cable', brandName: 'Generic' }],
  'Accessories': [{ id: 700, name: '12V Power Adapter', slug: 'power-1', price: 350, stock: 50, isFeatured: false, categoryName: 'Accessories', brandName: 'Generic' },
    { id: 701, name: 'BNC Video Balun 10-Pack', slug: 'bnc-1', price: 2500, stock: 25, isFeatured: false, categoryName: 'Accessories', brandName: 'Generic' }],
  'Networking': [{ id: 800, name: 'TP-Link 8-Port PoE Switch', slug: 'switch-1', price: 8500, stock: 12, isFeatured: false, categoryName: 'Networking', brandName: 'TP-Link' },
    { id: 801, name: 'Ruijie 16-Port Switch', slug: 'switch-2', price: 12000, stock: 8, isFeatured: false, categoryName: 'Networking', brandName: 'Ruijie' }],
  'UPS': [{ id: 900, name: 'APC UPS 1200VA', slug: 'ups-1', price: 11500, stock: 10, isFeatured: false, categoryName: 'UPS', brandName: 'APC' },
    { id: 901, name: 'Power Guard 650VA', slug: 'ups-2', price: 4500, stock: 15, isFeatured: false, categoryName: 'UPS', brandName: 'Power Guard' }],
};

export default function PackageBuilderPage() {
  const [selectedProducts, setSelectedProducts] = useState<Record<string, ProductListDto>>({});
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [slotSearch, setSlotSearch] = useState('');
  const { addItem } = useCartStore();

  const activeSlotDef = useMemo(() => {
    if (!activeSlot) return null;
    const sectionKey = activeSlot.split('_')[0];
    const section = sections.find(s => s.key === sectionKey);
    if (!section) return null;
    return {
      key: activeSlot,
      label: section.label,
      icon: section.icon,
      color: section.color,
      category: section.category,
    };
  }, [activeSlot]);

  const slotProducts = useMemo(() => {
    if (!activeSlotDef) return [];
    if (activeSlotDef.category === 'Camera') {
      return [
        ...(mockProductsByCategory['IP Camera'] || []),
        ...(mockProductsByCategory['CC Camera'] || [])
      ];
    }
    return mockProductsByCategory[activeSlotDef.category] || [];
  }, [activeSlotDef]);

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
                  <span className={styles.statValue}>{slots.length - filledSlots}</span>
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
                <input type="text" placeholder={`Search ${activeSlotDef?.category} products...`}
                  value={slotSearch} onChange={e => setSlotSearch(e.target.value)} autoFocus />
              </div>
              <div className={styles.modalProducts}>
                {filteredSlotProducts.length === 0 ? (
                  <div className={styles.noProducts}>No products found</div>
                ) : (
                  filteredSlotProducts.map(product => {
                    const isSelected = selectedProducts[activeSlot]?.id === product.id;
                    return (
                      <button key={product.id} className={`${styles.productOption} ${isSelected ? styles.productSelected : ''}`}
                        onClick={() => selectProduct(product)}>
                        <div className={styles.productOptionIcon}><Zap size={18} /></div>
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
