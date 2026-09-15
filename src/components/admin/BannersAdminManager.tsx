'use client';
import { useState } from 'react';
import { usePolicyPage } from '@/hooks/usePolicyPage';
import { PolicySectionDto, PolicyPageDto } from '@/lib/api';
import HomeInfiniteBanner from '@/components/home/HomeInfiniteBanner';
import ProductBannerSection from '@/components/products/ProductBannerSection';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Label, Textarea } from '@/components/ui/shadcn';
import { LayoutGrid, ShoppingBag, Plus, Trash2, Edit3, Eye, Check, X, Sparkles, MoveUp, MoveDown } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './BannersAdminManager.module.css';

type BannerType = 'home' | 'product';

const DEFAULT_HOME_SECTIONS: PolicySectionDto[] = [
  { order: 1, title: '100% Genuine Products', body: 'Direct from authorized brand distributors', highlightTitle: 'GENUINE', highlightText: '🛡️' },
  { order: 2, title: 'Express Fast Delivery', body: 'Inside Dhaka 5 Days • Nationwide 10 Days', highlightTitle: 'EXPRESS', highlightText: '🚚' },
  { order: 3, title: '7-10 Days Return & Exchange', body: 'Hassle-free replacement guarantee', highlightTitle: 'EXCHANGE', highlightText: '🔄' },
  { order: 4, title: '0% EMI Facility Available', body: 'Up to 36 months on major credit cards', highlightTitle: '0% EMI', highlightText: '💳' },
  { order: 5, title: '24/7 Expert Technical Support', body: 'Certified security engineers on standby', highlightTitle: 'SUPPORT', highlightText: '🎧' },
  { order: 6, title: 'Professional On-Site Installation', body: 'Nationwide setup and warranty coverage', highlightTitle: 'SETUP', highlightText: '⚡' },
];

const DEFAULT_PRODUCT_SECTIONS: PolicySectionDto[] = [
  { order: 1, title: 'Fast Delivery', body: 'Inside Dhaka 5 Days • Outside Dhaka 10 Days nationwide express shipping.', highlightTitle: 'DELIVERY', highlightText: '🚚' },
  { order: 2, title: 'Official Warranty', body: '100% Genuine product with authorized brand warranty support.', highlightTitle: 'WARRANTY', highlightText: '🛡️' },
  { order: 3, title: 'Easy Exchange', body: '7 to 10 working days hassle-free return and exchange guarantee.', highlightTitle: 'EXCHANGE', highlightText: '🔄' },
];

export default function BannersAdminManager() {
  const [activeBannerType, setActiveBannerType] = useState<BannerType>('home');
  const homePolicy = usePolicyPage('home-banner');
  const productPolicy = usePolicyPage('product-banner');

  const currentPolicy = activeBannerType === 'home' ? homePolicy : productPolicy;
  const currentSlug = activeBannerType === 'home' ? 'home-banner' : 'product-banner';

  const defaultSections = activeBannerType === 'home' ? DEFAULT_HOME_SECTIONS : DEFAULT_PRODUCT_SECTIONS;
  const currentSections = currentPolicy.page?.sections && currentPolicy.page.sections.length > 0
    ? currentPolicy.page.sections
    : defaultSections;

  const sortedSections = [...currentSections].sort((a, b) => a.order - b.order);

  // Modal State for Add / Edit
  const [editingItem, setEditingItem] = useState<{
    isNew: boolean;
    order: number;
    title: string;
    body: string;
    highlightTitle: string;
    highlightText: string;
  } | null>(null);

  const [saving, setSaving] = useState(false);

  const handleOpenAdd = () => {
    const nextOrder = sortedSections.length > 0
      ? Math.max(...sortedSections.map(s => s.order)) + 1
      : 1;

    setEditingItem({
      isNew: true,
      order: nextOrder,
      title: '',
      body: '',
      highlightTitle: '',
      highlightText: '🛡️',
    });
  };

  const handleOpenEdit = (item: PolicySectionDto) => {
    setEditingItem({
      isNew: false,
      order: item.order,
      title: item.title,
      body: item.body ?? '',
      highlightTitle: item.highlightTitle ?? '',
      highlightText: item.highlightText ?? '',
    });
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editingItem.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSaving(true);
    try {
      let updatedSections: PolicySectionDto[] = [];

      if (editingItem.isNew) {
        updatedSections = [
          ...sortedSections,
          {
            order: editingItem.order,
            title: editingItem.title.trim(),
            body: editingItem.body.trim(),
            highlightTitle: editingItem.highlightTitle.trim() || undefined,
            highlightText: editingItem.highlightText.trim() || undefined,
          },
        ];
      } else {
        updatedSections = sortedSections.map(s => {
          if (s.order === editingItem.order) {
            return {
              ...s,
              title: editingItem.title.trim(),
              body: editingItem.body.trim(),
              highlightTitle: editingItem.highlightTitle.trim() || undefined,
              highlightText: editingItem.highlightText.trim() || undefined,
            };
          }
          return s;
        });
      }

      // Re-index orders sequentially
      updatedSections = updatedSections.map((s, idx) => ({ ...s, order: idx + 1 }));

      const pagePayload: PolicyPageDto = {
        id: currentPolicy.page?.id ?? '0',
        slug: currentSlug,
        title: activeBannerType === 'home' ? 'Homepage Continuous Infinite Banner' : 'Product Page Guarantee & Notice Banner',
        subtitle: activeBannerType === 'home'
          ? 'Infinite marquee banner text scrolling directly below hero section on homepage'
          : 'Banner items and guarantee options displayed directly beneath Add to Cart and chips on product pages',
        badge: activeBannerType === 'home' ? 'Marquee Announcement' : 'Product Value Assurance',
        lastUpdated: 'September 2026',
        updatedAt: new Date().toISOString(),
        sections: updatedSections,
      };

      await currentPolicy.updateFullPage(pagePayload);
      toast.success(editingItem.isNew ? 'Banner item added.' : 'Banner item updated.');
      setEditingItem(null);
    } catch {
      toast.error('Failed to save banner item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (orderToDelete: number) => {
    if (!confirm('Are you sure you want to delete this banner item?')) return;

    setSaving(true);
    try {
      const remainingSections = sortedSections
        .filter(s => s.order !== orderToDelete)
        .map((s, idx) => ({ ...s, order: idx + 1 }));

      const pagePayload: PolicyPageDto = {
        id: currentPolicy.page?.id ?? '0',
        slug: currentSlug,
        title: activeBannerType === 'home' ? 'Homepage Continuous Infinite Banner' : 'Product Page Guarantee & Notice Banner',
        subtitle: activeBannerType === 'home'
          ? 'Infinite marquee banner text scrolling directly below hero section on homepage'
          : 'Banner items and guarantee options displayed directly beneath Add to Cart and chips on product pages',
        badge: activeBannerType === 'home' ? 'Marquee Announcement' : 'Product Value Assurance',
        lastUpdated: 'September 2026',
        updatedAt: new Date().toISOString(),
        sections: remainingSections,
      };

      await currentPolicy.updateFullPage(pagePayload);
      toast.success('Banner item removed.');
    } catch {
      toast.error('Failed to remove banner item.');
    } finally {
      setSaving(false);
    }
  };

  const handleMoveOrder = async (order: number, direction: 'up' | 'down') => {
    const idx = sortedSections.findIndex(s => s.order === order);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sortedSections.length) return;

    const reordered = [...sortedSections];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(targetIdx, 0, moved);

    const updatedSections = reordered.map((s, i) => ({ ...s, order: i + 1 }));

    setSaving(true);
    try {
      const pagePayload: PolicyPageDto = {
        id: currentPolicy.page?.id ?? '0',
        slug: currentSlug,
        title: activeBannerType === 'home' ? 'Homepage Continuous Infinite Banner' : 'Product Page Guarantee & Notice Banner',
        subtitle: activeBannerType === 'home'
          ? 'Infinite marquee banner text scrolling directly below hero section on homepage'
          : 'Banner items and guarantee options displayed directly beneath Add to Cart and chips on product pages',
        badge: activeBannerType === 'home' ? 'Marquee Announcement' : 'Product Value Assurance',
        lastUpdated: 'September 2026',
        updatedAt: new Date().toISOString(),
        sections: updatedSections,
      };

      await currentPolicy.updateFullPage(pagePayload);
      toast.success('Order updated.');
    } catch {
      toast.error('Failed to reorder banner items.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Sub-Tab Navigation: Home Banners vs Product Banners */}
      <div className={styles.subTabNav}>
        <button
          type="button"
          className={`${styles.subTabBtn} ${activeBannerType === 'home' ? styles.subTabBtnActive : ''}`}
          onClick={() => setActiveBannerType('home')}
        >
          <LayoutGrid size={16} /> Home Banners (Infinite Loop)
        </button>
        <button
          type="button"
          className={`${styles.subTabBtn} ${activeBannerType === 'product' ? styles.subTabBtnActive : ''}`}
          onClick={() => setActiveBannerType('product')}
        >
          <ShoppingBag size={16} /> Product Banners (Detail Page)
        </button>
      </div>

      {/* Live Preview Card */}
      <div className={styles.previewSection}>
        <div className={styles.previewHeader}>
          <span className={styles.previewLabel}>
            <Eye size={14} />
            {activeBannerType === 'home' ? 'Live Infinite-Loop Marquee Preview (Homepage)' : 'Live Product Banner Preview (Product Detail Page)'}
          </span>
          <span className="badge badge-primary">{sortedSections.length} Items</span>
        </div>

        <div className={styles.previewBox}>
          {activeBannerType === 'home' ? (
            <HomeInfiniteBanner />
          ) : (
            <div style={{ padding: '16px', maxWidth: '520px' }}>
              <ProductBannerSection productNotes="Sample dynamic product note configured from the product editor." />
            </div>
          )}
        </div>
      </div>

      {/* Items Management List */}
      <Card>
        <CardHeader className={styles.itemsHeader}>
          <div>
            <CardTitle>
              {activeBannerType === 'home' ? 'Home Banner Items' : 'Product Banner Options'}
            </CardTitle>
            <CardDescription>
              {activeBannerType === 'home'
                ? 'These items scroll continuously in an infinite loop directly beneath the Hero section on the homepage.'
                : 'These guarantee items scroll continuously in an infinite loop directly beneath the delivery time and return policy box on all product detail pages.'}
            </CardDescription>
          </div>
          <Button onClick={handleOpenAdd} className="btn-sm">
            <Plus size={16} /> Add Banner Item
          </Button>
        </CardHeader>
        <CardContent>
          {sortedSections.length === 0 ? (
            <div className={styles.emptyState}>No banner items configured. Click &quot;Add Banner Item&quot; to create one.</div>
          ) : (
            <div className={styles.itemsList}>
              {sortedSections.map((item, idx) => (
                <div key={item.order} className={styles.itemCard}>
                  <div className={styles.itemMain}>
                    <div className={styles.itemOrderBadge}>#{item.order}</div>
                    {item.highlightText && <span className={styles.itemEmoji}>{item.highlightText}</span>}
                    <div className={styles.itemDetails}>
                      <div className={styles.itemTitleRow}>
                        <h4 className={styles.itemTitle}>{item.title}</h4>
                        {item.highlightTitle && <span className={styles.itemTag}>{item.highlightTitle}</span>}
                      </div>
                      {item.body && <p className={styles.itemBody}>{item.body}</p>}
                    </div>
                  </div>

                  <div className={styles.itemActions}>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={idx === 0 || saving}
                      onClick={() => handleMoveOrder(item.order, 'up')}
                      title="Move Up"
                    >
                      <MoveUp size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={idx === sortedSections.length - 1 || saving}
                      onClick={() => handleMoveOrder(item.order, 'down')}
                      title="Move Down"
                    >
                      <MoveDown size={14} />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenEdit(item)}
                      disabled={saving}
                    >
                      <Edit3 size={14} /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteItem(item.order)}
                      disabled={saving}
                      title="Delete Item"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Modal */}
      {editingItem && (
        <div className={styles.modalOverlay} onClick={() => setEditingItem(null)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingItem.isNew ? 'Add Banner Item' : `Edit Banner Item #${editingItem.order}`}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setEditingItem(null)}>
                <X size={18} />
              </Button>
            </div>

            <form onSubmit={handleSaveItem} className={styles.modalForm}>
              <div className={styles.grid2}>
                <Field label="Icon / Emoji">
                  <Input
                    placeholder="e.g. 🛡️, 🚚, 🔄, 💳, ⚡"
                    value={editingItem.highlightText}
                    onChange={e => setEditingItem({ ...editingItem, highlightText: e.target.value })}
                  />
                </Field>
                <Field label="Badge / Tag Text">
                  <Input
                    placeholder="e.g. GENUINE, EXPRESS, 0% EMI"
                    value={editingItem.highlightTitle}
                    onChange={e => setEditingItem({ ...editingItem, highlightTitle: e.target.value })}
                  />
                </Field>
              </div>

              <Field label="Title" required>
                <Input
                  placeholder="e.g. 100% Genuine Products"
                  value={editingItem.title}
                  onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                  required
                />
              </Field>

              <Field label="Description / Body Text">
                <Textarea
                  rows={2}
                  placeholder="e.g. Direct from authorized brand distributors with official Bangladesh warranty"
                  value={editingItem.body}
                  onChange={e => setEditingItem({ ...editingItem, body: e.target.value })}
                />
              </Field>

              <div className={styles.modalFooter}>
                <Button type="button" variant="ghost" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  <Check size={16} /> Save Item
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <Label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem' }}>
        {label} {required && <span style={{ color: 'var(--color-error, #ef4444)' }}>*</span>}
      </Label>
      {children}
    </div>
  );
}

