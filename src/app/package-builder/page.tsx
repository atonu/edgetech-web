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

  const activeSlotDef = slots.find(s => s.key === activeSlot);
  const slotProducts = activeSlotDef ? (mockProductsByCategory[activeSlotDef.category] || []) : [];
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
          {/* Slot Grid */}
          <div className={styles.slotGrid}>
            {slots.map((slot, i) => {
              const selected = selectedProducts[slot.key];
              return (
                <motion.div key={slot.key} className={`${styles.slotCard} ${selected ? styles.slotFilled : ''}`}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <div className={styles.slotHeader}>
                    <div className={styles.slotIcon} style={{ background: `${slot.color}15`, color: slot.color }}>
                      <slot.icon size={18} />
                    </div>
                    <span className={styles.slotLabel}>{slot.label}</span>
                    {selected && (
                      <button className={styles.clearSlotBtn} onClick={() => clearSlot(slot.key)}>
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {selected ? (
                    <div className={styles.selectedProduct}>
                      <span className={styles.selectedName}>{selected.name}</span>
                      <span className={styles.selectedPrice}>৳{(selected.discountPrice ?? selected.price).toLocaleString()}</span>
                      <span className={styles.selectedBrand}>{selected.brandName}</span>
                    </div>
                  ) : (
                    <button className={styles.selectBtn} onClick={() => { setActiveSlot(slot.key); setSlotSearch(''); }}>
                      <Plus size={16} /> Select {slot.label}
                    </button>
                  )}
                </motion.div>
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
                    const slot = slots.find(s => s.key === key);
                    return (
                      <div key={key} className={styles.selectedItem}>
                        <span className={styles.selectedItemSlot}>{slot?.label}</span>
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
              transition={{ type: 'spring', damping: 25 }} onClick={e => e.stopPropagation()}>
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
