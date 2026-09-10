'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Package as PackageIcon, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  adminPackagesApi,
  packageBuilderApi,
  productImagesApi,
  PackageDto,
  PackageItemDto,
  ProductListDto,
} from '@/lib/api';
import { getImageUrl } from '@/lib/imageUrl';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  Table,
  TableWrap,
  TD,
  Textarea,
  TH,
} from '@/components/ui/shadcn';
import { Skeleton } from '@/components/ui/Skeleton';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import SolutionBuilder, { buildProductsByBase } from '@/components/builder/SolutionBuilder';
import styles from './PackageManager.module.css';

const emptyForm = { id: 0, name: '', description: '', imageUrl: '', isActive: true, isFeatured: false, regularPrice: 0, packagePrice: 0 };

// Rebuilds a ProductListDto for a saved package item so it can populate the builder even if
// the underlying product is no longer surfaced by the slot endpoint (inactive / re-categorized).
function itemToProduct(item: PackageItemDto): ProductListDto {
  return {
    id: item.productId,
    name: item.productName,
    slug: '',
    price: item.unitPrice,
    discountPrice: undefined,
    primaryImageUrl: item.imageUrl,
    stock: item.stock,
    isFeatured: false,
    categoryName: '',
    brandName: '',
  };
}

export default function PackageManager() {
  const [productsByBase, setProductsByBase] = useState<Record<string, ProductListDto[]>>({});
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [packages, setPackages] = useState<PackageDto[]>([]);
  const [listLoading, setListLoading] = useState(true);

  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState<Record<string, ProductListDto>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<PackageDto | null>(null);
  const [search, setSearch] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const formTopRef = useRef<HTMLDivElement>(null);
  // Tracks whether the admin manually edited the regular price, so item changes stop auto-filling it.
  const regularDirty = useRef(false);

  const loadPackages = async () => {
    setListLoading(true);
    try {
      const res = await adminPackagesApi.getAll();
      setPackages(res.data ?? []);
    } catch {
      toast.error('Failed to load packages.');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    packageBuilderApi.getSlots()
      .then(res => setProductsByBase(buildProductsByBase(res.data)))
      .catch(() => toast.error('Failed to load builder products.'))
      .finally(() => setSlotsLoading(false));
    loadPackages();
  }, []);

  // Live sum of the selected components — the auto-fill source for the regular price.
  const itemsTotal = useMemo(
    () => Object.values(selected).reduce((sum, p) => sum + (p.discountPrice ?? p.price), 0),
    [selected]
  );
  const selectedCount = Object.keys(selected).length;
  const savings = form.regularPrice - form.packagePrice;

  // Keep the regular price synced to the item sum until the admin overrides it.
  useEffect(() => {
    if (!regularDirty.current) {
      setForm(f => (f.regularPrice === itemsTotal ? f : { ...f, regularPrice: itemsTotal }));
    }
  }, [itemsTotal]);

  const onSelect = (slotKey: string, product: ProductListDto) =>
    setSelected(prev => ({ ...prev, [slotKey]: product }));

  const onClear = (slotKey: string) =>
    setSelected(prev => {
      const next = { ...prev };
      delete next[slotKey];
      return next;
    });

  const resetForm = () => {
    regularDirty.current = false;
    setForm(emptyForm);
    setSelected({});
  };

  const handleImageSelected = async (file: File | undefined) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const { url } = await productImagesApi.upload(file);
      setForm(f => ({ ...f, imageUrl: url }));
    } catch {
      toast.error('Failed to upload package image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const editPackage = (pkg: PackageDto) => {
    regularDirty.current = true; // preserve the saved regular price rather than re-summing.
    setForm({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description ?? '',
      imageUrl: pkg.imageUrl ?? '',
      isActive: pkg.isActive,
      isFeatured: pkg.isFeatured,
      regularPrice: pkg.regularPrice,
      packagePrice: pkg.packagePrice,
    });

    const reconstructed: Record<string, ProductListDto> = {};
    pkg.items.forEach((item, idx) => {
      const base = item.slotKey.split('_')[0];
      const fromSlots = productsByBase[base]?.find(p => p.id === item.productId);
      // Guarantee a unique key even if two saved items shared a slotKey.
      const key = reconstructed[item.slotKey] ? `${item.slotKey}_${idx}` : item.slotKey;
      reconstructed[key] = fromSlots ?? itemToProduct(item);
    });
    setSelected(reconstructed);

    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const savePackage = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Package name is required.');
      return;
    }
    if (selectedCount === 0) {
      toast.error('Add at least one product to the package.');
      return;
    }
    if (form.packagePrice <= 0) {
      toast.error('Set a package price greater than zero.');
      return;
    }

    const items = Object.entries(selected).map(([slotKey, product]) => ({
      // Strip the uniqueness suffix we may have added while editing so the stored slot stays clean.
      slotKey: slotKey.split('_').slice(0, 2).join('_'),
      productId: product.id,
      quantity: 1,
    }));

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      imageUrl: form.imageUrl || undefined,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      regularPrice: form.regularPrice,
      packagePrice: form.packagePrice,
      items,
    };

    setBusy('save');
    try {
      if (form.id) {
        await adminPackagesApi.update(form.id, payload);
        toast.success('Package updated.');
      } else {
        await adminPackagesApi.create(payload);
        toast.success('Package created.');
      }
      resetForm();
      await loadPackages();
    } catch {
      toast.error('Failed to save package.');
    } finally {
      setBusy(null);
    }
  };

  const deletePackage = async () => {
    const target = confirmTarget;
    setConfirmTarget(null);
    if (!target) return;
    setBusy(`delete-${target.id}`);
    try {
      await adminPackagesApi.delete(target.id);
      toast.success('Package removed.');
      if (form.id === target.id) resetForm();
      await loadPackages();
    } catch {
      toast.error('Failed to remove package.');
    } finally {
      setBusy(null);
    }
  };

  const filteredPackages = search.trim()
    ? packages.filter(p =>
        p.name.toLowerCase().includes(search.trim().toLowerCase()) ||
        (p.description ?? '').toLowerCase().includes(search.trim().toLowerCase()))
    : packages;

  return (
    <div className={styles.wrap}>
      <Card>
        <div ref={formTopRef} />
        <CardHeader>
          <CardTitle>{form.id ? `Edit Package #${form.id}` : 'Create Package'}</CardTitle>
          <CardDescription>
            Bundle products with the same device selector customers use, then set a discounted package price.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={savePackage}>
            <div className={styles.metaGrid}>
              <div>
                <Label>Package Name</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. 4-Camera Home Bundle" required />
              </div>
              <div>
                <Label>Active</Label>
                <Select value={String(form.isActive)} onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Select>
              </div>
              <div>
                <Label>Show in Best Sellers</Label>
                <Select value={String(form.isFeatured)} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.value === 'true' }))}>
                  <option value="false">No</option>
                  <option value="true">Yes — feature on home page</option>
                </Select>
              </div>
              <div>
                <Label>Package Image</Label>
                <div className={styles.imageUploadRow}>
                  {form.imageUrl ? (
                    <div className={styles.imagePreview}>
                      <Image src={getImageUrl(form.imageUrl)!} alt="Package" fill sizes="96px" style={{ objectFit: 'cover' }} />
                      <button type="button" className={styles.imageRemove} onClick={() => setForm(f => ({ ...f, imageUrl: '' }))} aria-label="Remove image">
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <label className={styles.imageDrop}>
                      <input type="file" accept="image/*" hidden onChange={e => handleImageSelected(e.target.files?.[0])} />
                      {uploadingImage ? 'Uploading…' : (<><Upload size={15} /> Upload image</>)}
                    </label>
                  )}
                </div>
              </div>
              <div className={styles.fullWidth}>
                <Label>Description</Label>
                <Textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description shown to customers." />
              </div>
            </div>

            <div className={styles.builderLayout}>
              <div className={styles.builderCol}>
                <p className={styles.builderHint}>Add each device that belongs in this package.</p>
                {slotsLoading ? (
                  <SolutionBuilder productsByBase={{}} loading selectedProducts={{}} onSelect={() => {}} onClear={() => {}} />
                ) : (
                  <SolutionBuilder
                    productsByBase={productsByBase}
                    loading={false}
                    selectedProducts={selected}
                    onSelect={onSelect}
                    onClear={onClear}
                  />
                )}
              </div>

              <div className={styles.pricingCol}>
                <div className={styles.pricingCard}>
                  <div className={styles.pricingTitle}><PackageIcon size={16} /> Package Pricing</div>

                  <div>
                    <Label>Regular Total Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.regularPrice}
                      onChange={e => { regularDirty.current = true; setForm(f => ({ ...f, regularPrice: Number(e.target.value) })); }}
                      placeholder="Sum of item prices"
                    />
                    <button
                      type="button"
                      className={styles.matchBtn}
                      onClick={() => { regularDirty.current = false; setForm(f => ({ ...f, regularPrice: itemsTotal })); }}
                    >
                      Recalculate from items (৳{itemsTotal.toLocaleString()})
                    </button>
                    <span className={styles.componentCount}> · {selectedCount} component{selectedCount === 1 ? '' : 's'} selected</span>
                  </div>

                  <div>
                    <Label>Package Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.packagePrice}
                      onChange={e => setForm(f => ({ ...f, packagePrice: Number(e.target.value) }))}
                      placeholder="Discounted bundle price"
                      required
                    />
                    {form.regularPrice > 0 && (
                      <button type="button" className={styles.matchBtn} onClick={() => setForm(f => ({ ...f, packagePrice: f.regularPrice }))}>
                        Match regular price (৳{form.regularPrice.toLocaleString()})
                      </button>
                    )}
                  </div>

                  {form.packagePrice > 0 && form.regularPrice > 0 && (
                    <div className={`${styles.savingsBox} ${savings < 0 ? styles.savingsBoxNegative : ''}`}>
                      <span>{savings >= 0 ? 'Customer saves' : 'Above regular'}</span>
                      <span className={`${styles.savingsValue} ${savings < 0 ? styles.savingsValueNegative : ''}`}>
                        ৳{Math.abs(savings).toLocaleString()}
                        {form.regularPrice > 0 ? ` (${Math.round((Math.abs(savings) / form.regularPrice) * 100)}%)` : ''}
                      </span>
                    </div>
                  )}

                  <div className={styles.pricingActions}>
                    <Button type="submit" loading={busy === 'save'}>{form.id ? 'Update Package' : 'Create Package'}</Button>
                    <Button type="button" variant="ghost" onClick={resetForm}>Clear</Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Packages</CardTitle>
          <CardDescription>Manage bundle templates customers can add to their cart in one click.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={styles.metaGrid} style={{ marginBottom: '0.75rem', gridTemplateColumns: '1fr' }}>
            <div>
              <Label>Search</Label>
              <Input placeholder="Search packages by name…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <TH>ID</TH><TH>Name</TH><TH>Components</TH><TH>Price</TH><TH>Status</TH><TH>Actions</TH>
                </tr>
              </thead>
              <tbody>
                {listLoading ? (
                  Array.from({ length: 3 }).map((_, r) => (
                    <tr key={`pkg-skel-${r}`}>
                      {Array.from({ length: 6 }).map((_, c) => (
                        <TD key={`pkg-skel-${r}-${c}`}><Skeleton width={c === 5 ? '4rem' : '80%'} /></TD>
                      ))}
                    </tr>
                  ))
                ) : filteredPackages.length === 0 ? (
                  <tr><TD colSpan={6}>No packages yet. Build one above.</TD></tr>
                ) : filteredPackages.map(pkg => (
                  <tr key={pkg.id}>
                    <TD>{pkg.id}</TD>
                    <TD>
                      <div className={styles.nameCell}>
                        {pkg.imageUrl ? (
                          <Image src={getImageUrl(pkg.imageUrl)!} alt="" width={40} height={40} className={styles.nameThumb} />
                        ) : (
                          <div className={styles.nameThumbPlaceholder}><PackageIcon size={16} /></div>
                        )}
                        <div>
                          <strong>{pkg.name}</strong>
                          {pkg.description && <div className={styles.itemsCell}>{pkg.description}</div>}
                        </div>
                      </div>
                    </TD>
                    <TD>
                      <div className={styles.itemsCell}>{pkg.items.map(i => i.productName).join(', ')}</div>
                    </TD>
                    <TD>
                      <div className={styles.pricePair}>
                        <span className={styles.pkgPrice}>৳{pkg.packagePrice.toLocaleString()}</span>
                        {pkg.regularPrice > pkg.packagePrice && (
                          <span className={styles.regStrike}>৳{pkg.regularPrice.toLocaleString()}</span>
                        )}
                      </div>
                    </TD>
                    <TD>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        <Badge variant={pkg.isActive ? 'success' : 'secondary'}>{pkg.isActive ? 'Active' : 'Hidden'}</Badge>
                        {pkg.isFeatured && <Badge variant="default">Best Seller</Badge>}
                      </div>
                    </TD>
                    <TD>
                      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                        <Button size="sm" variant="outline" onClick={() => editPackage(pkg)}>Edit</Button>
                        <Button size="sm" variant="destructive" loading={busy === `delete-${pkg.id}`} onClick={() => setConfirmTarget(pkg)}>Delete</Button>
                      </div>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </CardContent>
      </Card>

      {confirmTarget && (
        <ConfirmDialog
          title="Delete package"
          message={`Delete package "${confirmTarget.name}"? This cannot be undone.`}
          loading={busy === `delete-${confirmTarget.id}`}
          onConfirm={deletePackage}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  );
}
