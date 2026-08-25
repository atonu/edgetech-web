'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Boxes, FolderTree, PackageSearch, RefreshCcw, Search, ShoppingBag, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  adminProductGroupsApi,
  adminServicesApi,
  brandsApi,
  categoriesApi,
  ordersApi,
  productsApi,
  productImagesApi,
  CategoryDto,
  BrandDto,
  ProductDto,
  ProductGroupDto,
  ProductListDto,
  ServiceItemDto,
  OrderDto,
} from '@/lib/api';
import ProductImageManager, { StagedImage } from '@/components/admin/ProductImageManager';
import AdminPagination from '@/components/admin/AdminPagination';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
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
  Tabs,
  TabsList,
  TabsTrigger,
  TD,
  Textarea,
  TH,
} from '@/components/ui/shadcn';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePageWithReset } from '@/hooks/usePageWithReset';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './admin.module.css';

const ADMIN_PAGE_SIZE = 10;

type DeleteTarget = { type: 'product' | 'category' | 'brand' | 'service' | 'group'; id: number; label: string };

type TabKey = 'products' | 'categories' | 'brands' | 'services' | 'orders' | 'groups';

const ORDER_STATUSES = ['Placed', 'Verified', 'InProgress', 'Done', 'Cancelled'] as const;

function paginateClient<T>(items: T[], page: number, pageSize: number) {
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const start = (clampedPage - 1) * pageSize;
  return { pageItems: items.slice(start, start + pageSize), totalCount, totalPages, page: clampedPage };
}

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuthStore();
  const [tab, setTab] = useState<TabKey>('products');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const withBusy = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };

  const [products, setProducts] = useState<ProductListDto[]>([]);
  const [productDetails, setProductDetails] = useState<ProductDto | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [brands, setBrands] = useState<BrandDto[]>([]);
  const [services, setServices] = useState<ServiceItemDto[]>([]);
  const [groups, setGroups] = useState<ProductGroupDto[]>([]);

  const [productForm, setProductForm] = useState({
    id: 0,
    name: '',
    description: '',
    shortDescription: '',
    price: 0,
    discountPrice: 0,
    sku: '',
    stock: 0,
    categoryId: 0,
    brandId: 0,
    isFeatured: false,
    isActive: true,
  });

  const [stagedImages, setStagedImages] = useState<StagedImage[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [busyImageId, setBusyImageId] = useState<number | null>(null);

  const [categoryForm, setCategoryForm] = useState({ id: 0, name: '', isActive: true });
  const [brandForm, setBrandForm] = useState({ id: 0, name: '', description: '', logoUrl: '', isActive: true });
  const [serviceForm, setServiceForm] = useState({ id: 0, name: '', description: '', isActive: true });
  const [groupForm, setGroupForm] = useState({ id: 0, key: 'best-sellers', name: '', isActive: true, productIds: [] as number[] });
  const canAccessAdmin = isAuthenticated && isAdmin();

  const formTopRef = useRef<HTMLDivElement>(null);
  const scrollToForm = () => formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const [confirmDelete, setConfirmDelete] = useState<DeleteTarget | null>(null);

  // Products table: server-side search + pagination (separate from the unfiltered
  // `products` list above, which the Groups tab's product picker needs in full).
  const [productSearch, setProductSearch] = useState('');
  const [debouncedProductSearch, setDebouncedProductSearch] = useState('');
  const [productTablePage, setProductTablePage] = usePageWithReset(debouncedProductSearch);
  const [productTable, setProductTable] = useState<{ items: ProductListDto[]; totalCount: number; totalPages: number }>({ items: [], totalCount: 0, totalPages: 1 });
  const [productRefreshTick, setProductRefreshTick] = useState(0);
  const [resolvedProductKey, setResolvedProductKey] = useState<string | null>(null);
  const productRequestKey = useMemo(() => `${debouncedProductSearch}|${productTablePage}|${productRefreshTick}`, [debouncedProductSearch, productTablePage, productRefreshTick]);
  const productTableLoading = productRequestKey !== resolvedProductKey;

  // Orders table: server-side search + pagination.
  const [orderSearch, setOrderSearch] = useState('');
  const [debouncedOrderSearch, setDebouncedOrderSearch] = useState('');
  const [orderTablePage, setOrderTablePage] = usePageWithReset(debouncedOrderSearch);
  const [orderTable, setOrderTable] = useState<{ items: OrderDto[]; totalCount: number; totalPages: number }>({ items: [], totalCount: 0, totalPages: 1 });
  const [orderRefreshTick, setOrderRefreshTick] = useState(0);
  const [resolvedOrderKey, setResolvedOrderKey] = useState<string | null>(null);
  const orderRequestKey = useMemo(() => `${debouncedOrderSearch}|${orderTablePage}|${orderRefreshTick}`, [debouncedOrderSearch, orderTablePage, orderRefreshTick]);
  const orderTableLoading = orderRequestKey !== resolvedOrderKey;

  // Categories/Brands/Services/Groups: small, curated lists — client-side search + pagination
  // over the already-fully-loaded arrays instead of round-tripping to the server.
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryTablePage, setCategoryTablePage] = usePageWithReset(categorySearch);
  const [brandSearch, setBrandSearch] = useState('');
  const [brandTablePage, setBrandTablePage] = usePageWithReset(brandSearch);
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceTablePage, setServiceTablePage] = usePageWithReset(serviceSearch);
  const [groupSearch, setGroupSearch] = useState('');
  const [groupTablePage, setGroupTablePage] = usePageWithReset(groupSearch);

  const flatCategories = useMemo(() => {
    const out: CategoryDto[] = [];
    const walk = (arr: CategoryDto[]) => {
      arr.forEach(c => {
        out.push(c);
        if (c.subCategories?.length) walk(c.subCategories);
      });
    };
    walk(categories);
    return out;
  }, [categories]);

  const loadCore = async () => {
    setLoading(true);
    try {
      const [pRes, cRes, bRes, sRes, gRes] = await Promise.allSettled([
        productsApi.getAll({ page: 1, pageSize: 100 }),
        categoriesApi.getAllAdmin(),
        brandsApi.getAllAdmin(),
        adminServicesApi.getAll(),
        adminProductGroupsApi.getAll(),
      ]);

      setProducts(pRes.status === 'fulfilled' ? (pRes.value.data.items ?? []) : []);
      setCategories(cRes.status === 'fulfilled' ? (cRes.value.data ?? []) : []);
      setBrands(bRes.status === 'fulfilled' ? (bRes.value.data ?? []) : []);
      setServices(sRes.status === 'fulfilled' ? (sRes.value.data ?? []) : []);
      setGroups(gRes.status === 'fulfilled' ? (gRes.value.data ?? []) : []);

      const failed = [pRes, cRes, bRes, sRes, gRes].filter(r => r.status === 'rejected').length;
      if (failed > 0) toast.error(`Some admin data failed to load (${failed}). Showing available data.`);
    } catch {
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }

    setProductRefreshTick(t => t + 1);
    setOrderRefreshTick(t => t + 1);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    if (!isAdmin()) {
      router.replace('/');
      return;
    }

    loadCore();
  }, [isAuthenticated, isAdmin, router]);

  useEffect(() => {
    if (productForm.categoryId === 0 && flatCategories.length > 0) {
      setProductForm(prev => ({ ...prev, categoryId: flatCategories[0].id }));
    }
    if (productForm.brandId === 0 && brands.length > 0) {
      setProductForm(prev => ({ ...prev, brandId: brands[0].id }));
    }
  }, [flatCategories, brands, productForm.categoryId, productForm.brandId]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedProductSearch(productSearch), 350);
    return () => clearTimeout(timer);
  }, [productSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedOrderSearch(orderSearch), 350);
    return () => clearTimeout(timer);
  }, [orderSearch]);

  useEffect(() => {
    let active = true;
    productsApi.getAll({ search: debouncedProductSearch || undefined, page: productTablePage, pageSize: ADMIN_PAGE_SIZE })
      .then(res => {
        if (!active) return;
        setProductTable({ items: res.data.items ?? [], totalCount: res.data.totalCount, totalPages: res.data.totalPages || 1 });
      })
      .catch(() => {
        if (active) setProductTable({ items: [], totalCount: 0, totalPages: 1 });
      })
      .finally(() => {
        if (active) setResolvedProductKey(productRequestKey);
      });
    return () => { active = false; };
    // productRequestKey already encodes search, page, and the manual refresh tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productRequestKey]);

  useEffect(() => {
    let active = true;
    ordersApi.getAllOrders({ search: debouncedOrderSearch || undefined, page: orderTablePage, pageSize: ADMIN_PAGE_SIZE })
      .then(res => {
        if (!active) return;
        setOrderTable({ items: res.data.items ?? [], totalCount: res.data.totalCount, totalPages: res.data.totalPages || 1 });
      })
      .catch(() => {
        if (active) setOrderTable({ items: [], totalCount: 0, totalPages: 1 });
      })
      .finally(() => {
        if (active) setResolvedOrderKey(orderRequestKey);
      });
    return () => { active = false; };
    // orderRequestKey already encodes search, page, and the manual refresh tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderRequestKey]);

  const categoryTableResult = useMemo(
    () => paginateClient(
      categorySearch.trim()
        ? flatCategories.filter(c => c.name.toLowerCase().includes(categorySearch.trim().toLowerCase()))
        : flatCategories,
      categoryTablePage, ADMIN_PAGE_SIZE
    ),
    [flatCategories, categorySearch, categoryTablePage]
  );

  const brandTableResult = useMemo(
    () => paginateClient(
      brandSearch.trim()
        ? brands.filter(b => b.name.toLowerCase().includes(brandSearch.trim().toLowerCase()))
        : brands,
      brandTablePage, ADMIN_PAGE_SIZE
    ),
    [brands, brandSearch, brandTablePage]
  );

  const serviceTableResult = useMemo(
    () => paginateClient(
      serviceSearch.trim()
        ? services.filter(s => s.name.toLowerCase().includes(serviceSearch.trim().toLowerCase()) || (s.description ?? '').toLowerCase().includes(serviceSearch.trim().toLowerCase()))
        : services,
      serviceTablePage, ADMIN_PAGE_SIZE
    ),
    [services, serviceSearch, serviceTablePage]
  );

  const groupTableResult = useMemo(
    () => paginateClient(
      groupSearch.trim()
        ? groups.filter(g => g.name.toLowerCase().includes(groupSearch.trim().toLowerCase()) || g.key.toLowerCase().includes(groupSearch.trim().toLowerCase()))
        : groups,
      groupTablePage, ADMIN_PAGE_SIZE
    ),
    [groups, groupSearch, groupTablePage]
  );

  if (!canAccessAdmin) return null;

  const clearStagedImages = () => {
    stagedImages.forEach(s => URL.revokeObjectURL(s.previewUrl));
    setStagedImages([]);
  };

  const resetProductForm = () => {
    setProductDetails(null);
    clearStagedImages();
    setProductForm({
      id: 0,
      name: '',
      description: '',
      shortDescription: '',
      price: 0,
      discountPrice: 0,
      sku: '',
      stock: 0,
      categoryId: flatCategories[0]?.id ?? 0,
      brandId: brands[0]?.id ?? 0,
      isFeatured: false,
      isActive: true,
    });
  };

  const refreshProductDetails = async (slug: string) => {
    try {
      const res = await productsApi.getBySlug(slug);
      setProductDetails(res.data);
    } catch {
      toast.error('Failed to refresh product images.');
    }
  };

  const uploadImagesToProduct = async (id: number, files: File[]) => {
    setUploadingImage(true);
    try {
      for (const file of files) {
        try {
          const { url } = await productImagesApi.upload(file);
          await productsApi.addImage(id, url);
        } catch {
          toast.error(`Failed to upload ${file.name}.`);
        }
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFilesSelected = async (files: File[]) => {
    if (productForm.id > 0) {
      await uploadImagesToProduct(productForm.id, files);
      if (productDetails) await refreshProductDetails(productDetails.slug);
      await loadCore();
    } else {
      setStagedImages(prev => [...prev, ...files.map(file => ({ file, previewUrl: URL.createObjectURL(file) }))]);
    }
  };

  const handleRemoveStaged = (index: number) => {
    setStagedImages(prev => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSetPrimaryImage = async (imageId: number) => {
    if (!productDetails) return;
    setBusyImageId(imageId);
    try {
      await productsApi.setPrimaryImage(productDetails.id, imageId);
      await refreshProductDetails(productDetails.slug);
      await loadCore();
    } catch {
      toast.error('Failed to set primary image.');
    } finally {
      setBusyImageId(null);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!productDetails) return;
    setBusyImageId(imageId);
    try {
      const image = productDetails.images.find(i => i.id === imageId);
      await productsApi.deleteImage(productDetails.id, imageId);
      if (image) await productImagesApi.remove(image.imageUrl);
      await refreshProductDetails(productDetails.slug);
      await loadCore();
      toast.success('Image removed.');
    } catch {
      toast.error('Failed to remove image.');
    } finally {
      setBusyImageId(null);
    }
  };

  const editProduct = async (slug: string) => {
    clearStagedImages();
    try {
      const res = await productsApi.getBySlug(slug);
      const p = res.data;
      setProductDetails(p);
      setProductForm({
        id: p.id,
        name: p.name,
        description: p.description ?? '',
        shortDescription: p.shortDescription ?? '',
        price: p.price,
        discountPrice: p.discountPrice ?? 0,
        sku: p.sku ?? '',
        stock: p.stock,
        categoryId: p.categoryId,
        brandId: p.brandId,
        isFeatured: p.isFeatured,
        isActive: p.isActive,
      });
      setTab('products');
      scrollToForm();
    } catch {
      toast.error('Failed to load product details.');
    }
  };

  const saveProduct = async (e: FormEvent) => {
    e.preventDefault();
    await withBusy('save-product', async () => {
      try {
        const payload = {
          name: productForm.name,
          description: productForm.description,
          shortDescription: productForm.shortDescription,
          price: Number(productForm.price),
          discountPrice: productForm.discountPrice > 0 ? Number(productForm.discountPrice) : null,
          sku: productForm.sku,
          stock: Number(productForm.stock),
          categoryId: Number(productForm.categoryId),
          brandId: Number(productForm.brandId),
          isFeatured: productForm.isFeatured,
          isActive: productForm.isActive,
        };

        if (productForm.id) {
          await productsApi.update(productForm.id, payload);
          toast.success('Product updated.');
        } else {
          const created = await productsApi.create(payload);
          toast.success('Product created.');
          if (stagedImages.length > 0) {
            await uploadImagesToProduct(created.data.id, stagedImages.map(s => s.file));
          }
        }

        resetProductForm();
        await loadCore();
      } catch {
        toast.error('Failed to save product.');
      }
    });
  };

  const removeProduct = async (id: number) => {
    await withBusy(`delete-product-${id}`, async () => {
      try {
        await productsApi.delete(id);
        toast.success('Product removed.');
        await loadCore();
      } catch {
        toast.error('Failed to remove product.');
      }
    });
  };

  const saveCategory = async (e: FormEvent) => {
    e.preventDefault();
    await withBusy('save-category', async () => {
      try {
        const payload = {
          name: categoryForm.name,
          isActive: categoryForm.isActive,
        };

        if (categoryForm.id) {
          await categoriesApi.update(categoryForm.id, payload);
          toast.success('Category updated.');
        } else {
          await categoriesApi.create(payload);
          toast.success('Category created.');
        }

        setCategoryForm({ id: 0, name: '', isActive: true });
        await loadCore();
      } catch {
        toast.error('Failed to save category.');
      }
    });
  };

  const removeCategory = async (id: number) => {
    await withBusy(`delete-category-${id}`, async () => {
      try {
        await categoriesApi.delete(id);
        toast.success('Category removed.');
        await loadCore();
      } catch {
        toast.error('Failed to remove category.');
      }
    });
  };

  const saveBrand = async (e: FormEvent) => {
    e.preventDefault();
    await withBusy('save-brand', async () => {
      try {
        const payload = {
          name: brandForm.name,
          description: brandForm.description || null,
          logoUrl: brandForm.logoUrl || null,
          isActive: brandForm.isActive,
        };

        if (brandForm.id) {
          await brandsApi.update(brandForm.id, payload);
          toast.success('Brand updated.');
        } else {
          await brandsApi.create(payload);
          toast.success('Brand created.');
        }

        setBrandForm({ id: 0, name: '', description: '', logoUrl: '', isActive: true });
        await loadCore();
      } catch {
        toast.error('Failed to save brand.');
      }
    });
  };

  const removeBrand = async (id: number) => {
    await withBusy(`delete-brand-${id}`, async () => {
      try {
        await brandsApi.delete(id);
        toast.success('Brand removed.');
        await loadCore();
      } catch {
        toast.error('Failed to remove brand.');
      }
    });
  };

  const saveService = async (e: FormEvent) => {
    e.preventDefault();
    await withBusy('save-service', async () => {
      try {
        if (serviceForm.id) {
          await adminServicesApi.update(serviceForm.id, {
            name: serviceForm.name,
            description: serviceForm.description,
            isActive: serviceForm.isActive,
          });
          toast.success('Service updated.');
        } else {
          await adminServicesApi.create({ name: serviceForm.name, description: serviceForm.description });
          toast.success('Service created.');
        }

        setServiceForm({ id: 0, name: '', description: '', isActive: true });
        await loadCore();
      } catch {
        toast.error('Failed to save service.');
      }
    });
  };

  const removeService = async (id: number) => {
    await withBusy(`delete-service-${id}`, async () => {
      try {
        await adminServicesApi.delete(id);
        toast.success('Service removed.');
        await loadCore();
      } catch {
        toast.error('Failed to remove service.');
      }
    });
  };

  const saveGroup = async (e: FormEvent) => {
    e.preventDefault();
    await withBusy('save-group', async () => {
      try {
        if (groupForm.id) {
          await adminProductGroupsApi.update(groupForm.id, {
            name: groupForm.name,
            isActive: groupForm.isActive,
            productIds: groupForm.productIds,
          });
          toast.success('Group updated.');
        } else {
          await adminProductGroupsApi.create({
            key: groupForm.key,
            name: groupForm.name,
            isActive: groupForm.isActive,
            productIds: groupForm.productIds,
          });
          toast.success('Group created.');
        }

        setGroupForm({ id: 0, key: 'best-sellers', name: '', isActive: true, productIds: [] });
        await loadCore();
      } catch {
        toast.error('Failed to save group.');
      }
    });
  };

  const removeGroup = async (id: number) => {
    await withBusy(`delete-group-${id}`, async () => {
      try {
        await adminProductGroupsApi.delete(id);
        toast.success('Group removed.');
        await loadCore();
      } catch {
        toast.error('Failed to remove group.');
      }
    });
  };

  const updateOrder = async (id: number, status: string, notes?: string, adminNotes?: string) => {
    await withBusy(`save-order-${id}`, async () => {
      try {
        await ordersApi.updateAdmin(id, status, notes, adminNotes);
        toast.success('Order updated.');
        await loadCore();
      } catch {
        toast.error('Failed to update order.');
      }
    });
  };

  const editCategory = (c: CategoryDto) => {
    setCategoryForm({ id: c.id, name: c.name, isActive: c.isActive });
    setTab('categories');
    scrollToForm();
  };

  const editBrand = (b: BrandDto) => {
    setBrandForm({ id: b.id, name: b.name, description: b.description ?? '', logoUrl: b.logoUrl ?? '', isActive: b.isActive });
    setTab('brands');
    scrollToForm();
  };

  const editService = (s: ServiceItemDto) => {
    setServiceForm({ id: s.id, name: s.name, description: s.description ?? '', isActive: s.isActive });
    setTab('services');
    scrollToForm();
  };

  const editGroup = (g: ProductGroupDto) => {
    setGroupForm({ id: g.id, key: g.key, name: g.name, isActive: g.isActive, productIds: g.productIds });
    setTab('groups');
    scrollToForm();
  };

  const confirmDeleteLabel = (target: DeleteTarget) =>
    `Delete ${target.type === 'group' ? 'homepage group' : target.type} "${target.label}"? This action cannot be undone.`;

  const handleConfirmDelete = () => {
    const target = confirmDelete;
    setConfirmDelete(null);
    if (!target) return;
    switch (target.type) {
      case 'product': return void removeProduct(target.id);
      case 'category': return void removeCategory(target.id);
      case 'brand': return void removeBrand(target.id);
      case 'service': return void removeService(target.id);
      case 'group': return void removeGroup(target.id);
    }
  };

  return (
    <div className={styles.adminPage}>
      <div className="container">
        <Card className={styles.heroCard}>
          <CardContent className={styles.heroContent}>
            <div>
              <p className="section-label">Control Center</p>
              <h1 className={styles.pageTitle}>Admin Panel</h1>
              <p className={styles.muted}>Manage products, categories, services, homepage groups, and orders from one dashboard.</p>
            </div>
            <div className={styles.heroActions}>
              <Button variant="secondary" onClick={loadCore} loading={loading}>
                <RefreshCcw size={16} /> Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className={styles.metrics}>
          <Metric icon={<Boxes size={16} />} label="Products" value={productTable.totalCount} />
          <Metric icon={<FolderTree size={16} />} label="Categories" value={flatCategories.length} />
          <Metric icon={<Wrench size={16} />} label="Services" value={services.length} />
          <Metric icon={<ShoppingBag size={16} />} label="Orders" value={orderTable.totalCount} />
          <Metric icon={<PackageSearch size={16} />} label="Groups" value={groups.length} />
        </div>

        <Tabs>
          <TabsList>
            {[
              { key: 'products', label: 'Products' },
              { key: 'categories', label: 'Categories' },
              { key: 'brands', label: 'Brands' },
              { key: 'services', label: 'Services' },
              { key: 'groups', label: 'Groups' },
              { key: 'orders', label: 'Orders' },
            ].map(t => (
              <TabsTrigger key={t.key} active={tab === t.key} onClick={() => setTab(t.key as TabKey)}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {tab === 'products' && (
          <div className={styles.panelGrid}>
            <Card>
              <div ref={formTopRef} />
              <CardHeader>
                <CardTitle>{productForm.id ? `Edit Product #${productForm.id}` : 'Create Product'}</CardTitle>
                <CardDescription>Every product must have a valid category and brand.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={saveProduct} className={styles.grid2}>
                  <Field label="Name"><Input value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} required /></Field>
                  <Field label="SKU"><Input value={productForm.sku} onChange={e => setProductForm(p => ({ ...p, sku: e.target.value }))} /></Field>
                  <Field label="Price"><Input type="number" min="0" step="0.01" value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: Number(e.target.value) }))} required /></Field>
                  <Field label="Discount Price"><Input type="number" min="0" step="0.01" value={productForm.discountPrice} onChange={e => setProductForm(p => ({ ...p, discountPrice: Number(e.target.value) }))} /></Field>
                  <Field label="Stock"><Input type="number" min="0" value={productForm.stock} onChange={e => setProductForm(p => ({ ...p, stock: Number(e.target.value) }))} required /></Field>
                  <Field label="Category">
                    <Select value={productForm.categoryId} onChange={e => setProductForm(p => ({ ...p, categoryId: Number(e.target.value) }))} required>
                      <option value={0}>Select category</option>
                      {flatCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>
                  </Field>
                  <Field label="Brand">
                    <Select value={productForm.brandId} onChange={e => setProductForm(p => ({ ...p, brandId: Number(e.target.value) }))} required>
                      <option value={0}>Select brand</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </Select>
                  </Field>
                  <Field label="Short Description"><Input value={productForm.shortDescription} onChange={e => setProductForm(p => ({ ...p, shortDescription: e.target.value }))} /></Field>
                  <div className={styles.fullWidth}>
                    <Label>Description</Label>
                    <Textarea rows={3} value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div className={styles.fullWidth}>
                    <Label>Images</Label>
                    <ProductImageManager
                      images={productDetails?.images ?? []}
                      stagedImages={stagedImages}
                      uploading={uploadingImage}
                      busyImageId={busyImageId}
                      onFilesSelected={handleFilesSelected}
                      onRemoveStaged={handleRemoveStaged}
                      onSetPrimary={handleSetPrimaryImage}
                      onDelete={handleDeleteImage}
                    />
                  </div>
                  <Field label="Featured">
                    <Select value={String(productForm.isFeatured)} onChange={e => setProductForm(p => ({ ...p, isFeatured: e.target.value === 'true' }))}>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </Select>
                  </Field>
                  <Field label="Active">
                    <Select value={String(productForm.isActive)} onChange={e => setProductForm(p => ({ ...p, isActive: e.target.value === 'true' }))}>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </Select>
                  </Field>
                  <div className={`${styles.actions} ${styles.fullWidth}`}>
                    <Button type="submit" loading={busy === 'save-product'}>Save Product</Button>
                    <Button variant="ghost" type="button" onClick={resetProductForm}>Clear</Button>
                    {productDetails && <Badge variant="secondary">Slug: {productDetails.slug}</Badge>}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Products List</CardTitle>
                <CardDescription>Quick edit, verify stock and remove items.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={styles.searchBar}>
                  <Search size={15} />
                  <Input placeholder="Search products by name or description…" value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                </div>
                <TableWrap>
                  <Table>
                    <thead><tr><TH>Image</TH><TH>ID</TH><TH>Name</TH><TH>Category</TH><TH>Brand</TH><TH>Price</TH><TH>Stock</TH><TH>Actions</TH></tr></thead>
                    <tbody>
                      {productTableLoading ? (
                        <SkeletonRows cols={8} />
                      ) : productTable.items.length === 0 ? (
                        <tr><TD colSpan={8}>No products found.</TD></tr>
                      ) : productTable.items.map(p => (
                        <tr key={p.id}>
                          <TD>
                            {p.primaryImageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element -- tiny admin table thumbnail, not worth next/image config here
                              <img src={p.primaryImageUrl} alt="" className={styles.thumbnail} />
                            ) : (
                              <div className={styles.thumbnailPlaceholder} />
                            )}
                          </TD>
                          <TD>{p.id}</TD><TD>{p.name}</TD><TD>{p.categoryName}</TD><TD>{p.brandName}</TD>
                          <TD>{(p.discountPrice ?? p.price).toLocaleString()}</TD><TD>{p.stock}</TD>
                          <TD>
                            <div className={styles.actions}>
                              <Button size="sm" variant="outline" onClick={() => editProduct(p.slug)}>Edit</Button>
                              <Button size="sm" variant="destructive" loading={busy === `delete-product-${p.id}`} onClick={() => setConfirmDelete({ type: 'product', id: p.id, label: p.name })}>Delete</Button>
                            </div>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrap>
                <AdminPagination
                  page={productTablePage}
                  totalPages={productTable.totalPages}
                  totalCount={productTable.totalCount}
                  pageSize={ADMIN_PAGE_SIZE}
                  onPageChange={setProductTablePage}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'categories' && (
          <div className={styles.panelGrid}>
            <Card>
              <div ref={formTopRef} />
              <CardHeader><CardTitle>Category Form</CardTitle><CardDescription>Category schema: name + active only.</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={saveCategory} className={styles.grid2}>
                  <Field label="Name"><Input value={categoryForm.name} onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))} required /></Field>
                  <Field label="Active">
                    <Select value={String(categoryForm.isActive)} onChange={e => setCategoryForm(f => ({ ...f, isActive: e.target.value === 'true' }))}>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </Select>
                  </Field>
                  <div className={`${styles.actions} ${styles.fullWidth}`}>
                    <Button type="submit" loading={busy === 'save-category'}>Save Category</Button>
                    <Button variant="ghost" type="button" onClick={() => setCategoryForm({ id: 0, name: '', isActive: true })}>Clear</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Category List</CardTitle><CardDescription>Browse and maintain existing categories.</CardDescription></CardHeader>
              <CardContent>
                <div className={styles.searchBar}>
                  <Search size={15} />
                  <Input placeholder="Search categories by name…" value={categorySearch} onChange={e => setCategorySearch(e.target.value)} />
                </div>
                <TableWrap>
                  <Table>
                    <thead><tr><TH>ID</TH><TH>Name</TH><TH>Status</TH><TH>Actions</TH></tr></thead>
                    <tbody>
                      {loading ? (
                        <SkeletonRows cols={4} />
                      ) : categoryTableResult.pageItems.length === 0 ? (
                        <tr><TD colSpan={4}>No categories found.</TD></tr>
                      ) : categoryTableResult.pageItems.map(c => (
                        <tr key={c.id}>
                          <TD>{c.id}</TD><TD>{c.name}</TD><TD><Badge variant={c.isActive ? 'success' : 'secondary'}>{c.isActive ? 'Active' : 'Inactive'}</Badge></TD>
                          <TD>
                            <div className={styles.actions}>
                              <Button size="sm" variant="outline" onClick={() => editCategory(c)}>Edit</Button>
                              <Button size="sm" variant="destructive" loading={busy === `delete-category-${c.id}`} onClick={() => setConfirmDelete({ type: 'category', id: c.id, label: c.name })}>Delete</Button>
                            </div>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrap>
                <AdminPagination
                  page={categoryTableResult.page}
                  totalPages={categoryTableResult.totalPages}
                  totalCount={categoryTableResult.totalCount}
                  pageSize={ADMIN_PAGE_SIZE}
                  onPageChange={setCategoryTablePage}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'brands' && (
          <div className={styles.panelGrid}>
            <Card>
              <div ref={formTopRef} />
              <CardHeader><CardTitle>Brand Form</CardTitle><CardDescription>Create and update brands used by products.</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={saveBrand} className={styles.grid2}>
                  <Field label="Name"><Input value={brandForm.name} onChange={e => setBrandForm(f => ({ ...f, name: e.target.value }))} required /></Field>
                  <Field label="Logo URL"><Input value={brandForm.logoUrl} onChange={e => setBrandForm(f => ({ ...f, logoUrl: e.target.value }))} /></Field>
                  <Field label="Description"><Input value={brandForm.description} onChange={e => setBrandForm(f => ({ ...f, description: e.target.value }))} /></Field>
                  <Field label="Active">
                    <Select value={String(brandForm.isActive)} onChange={e => setBrandForm(f => ({ ...f, isActive: e.target.value === 'true' }))}>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </Select>
                  </Field>
                  <div className={`${styles.actions} ${styles.fullWidth}`}>
                    <Button type="submit" loading={busy === 'save-brand'}>Save Brand</Button>
                    <Button variant="ghost" type="button" onClick={() => setBrandForm({ id: 0, name: '', description: '', logoUrl: '', isActive: true })}>Clear</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Brand List</CardTitle><CardDescription>Existing brands from database.</CardDescription></CardHeader>
              <CardContent>
                <div className={styles.searchBar}>
                  <Search size={15} />
                  <Input placeholder="Search brands by name…" value={brandSearch} onChange={e => setBrandSearch(e.target.value)} />
                </div>
                <TableWrap>
                  <Table>
                    <thead><tr><TH>ID</TH><TH>Name</TH><TH>Status</TH><TH>Actions</TH></tr></thead>
                    <tbody>
                      {loading ? (
                        <SkeletonRows cols={4} />
                      ) : brandTableResult.pageItems.length === 0 ? (
                        <tr><TD colSpan={4}>No brands found.</TD></tr>
                      ) : brandTableResult.pageItems.map(b => (
                        <tr key={b.id}>
                          <TD>{b.id}</TD>
                          <TD>{b.name}</TD>
                          <TD><Badge variant={b.isActive ? 'success' : 'secondary'}>{b.isActive ? 'Active' : 'Inactive'}</Badge></TD>
                          <TD>
                            <div className={styles.actions}>
                              <Button size="sm" variant="outline" onClick={() => editBrand(b)}>Edit</Button>
                              <Button size="sm" variant="destructive" loading={busy === `delete-brand-${b.id}`} onClick={() => setConfirmDelete({ type: 'brand', id: b.id, label: b.name })}>Delete</Button>
                            </div>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrap>
                <AdminPagination
                  page={brandTableResult.page}
                  totalPages={brandTableResult.totalPages}
                  totalCount={brandTableResult.totalCount}
                  pageSize={ADMIN_PAGE_SIZE}
                  onPageChange={setBrandTablePage}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'services' && (
          <div className={styles.panelGrid}>
            <Card>
              <div ref={formTopRef} />
              <CardHeader><CardTitle>Service Form</CardTitle><CardDescription>Define service offerings shown in the platform.</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={saveService} className={styles.grid2}>
                  <Field label="Name"><Input value={serviceForm.name} onChange={e => setServiceForm(f => ({ ...f, name: e.target.value }))} required /></Field>
                  <Field label="Active">
                    <Select value={String(serviceForm.isActive)} onChange={e => setServiceForm(f => ({ ...f, isActive: e.target.value === 'true' }))}>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </Select>
                  </Field>
                  <div className={styles.fullWidth}><Label>Description</Label><Textarea rows={2} value={serviceForm.description} onChange={e => setServiceForm(f => ({ ...f, description: e.target.value }))} /></div>
                  <div className={`${styles.actions} ${styles.fullWidth}`}>
                    <Button type="submit" loading={busy === 'save-service'}>Save Service</Button>
                    <Button variant="ghost" type="button" onClick={() => setServiceForm({ id: 0, name: '', description: '', isActive: true })}>Clear</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Services List</CardTitle><CardDescription>Manage active and inactive services.</CardDescription></CardHeader>
              <CardContent>
                <div className={styles.searchBar}>
                  <Search size={15} />
                  <Input placeholder="Search services by name or description…" value={serviceSearch} onChange={e => setServiceSearch(e.target.value)} />
                </div>
                <TableWrap>
                  <Table>
                    <thead><tr><TH>ID</TH><TH>Name</TH><TH>Description</TH><TH>Status</TH><TH>Actions</TH></tr></thead>
                    <tbody>
                      {loading ? (
                        <SkeletonRows cols={5} />
                      ) : serviceTableResult.pageItems.length === 0 ? (
                        <tr><TD colSpan={5}>No services found.</TD></tr>
                      ) : serviceTableResult.pageItems.map(s => (
                        <tr key={s.id}>
                          <TD>{s.id}</TD><TD>{s.name}</TD><TD>{s.description}</TD>
                          <TD><Badge variant={s.isActive ? 'success' : 'secondary'}>{s.isActive ? 'Active' : 'Inactive'}</Badge></TD>
                          <TD>
                            <div className={styles.actions}>
                              <Button size="sm" variant="outline" onClick={() => editService(s)}>Edit</Button>
                              <Button size="sm" variant="destructive" loading={busy === `delete-service-${s.id}`} onClick={() => setConfirmDelete({ type: 'service', id: s.id, label: s.name })}>Delete</Button>
                            </div>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrap>
                <AdminPagination
                  page={serviceTableResult.page}
                  totalPages={serviceTableResult.totalPages}
                  totalCount={serviceTableResult.totalCount}
                  pageSize={ADMIN_PAGE_SIZE}
                  onPageChange={setServiceTablePage}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'groups' && (
          <div className={styles.panelGrid}>
            <Card>
              <div ref={formTopRef} />
              <CardHeader><CardTitle>Homepage Group Form</CardTitle><CardDescription>Control homepage spotlight sections.</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={saveGroup} className={styles.grid2}>
                  <Field label="Group Key">
                    <Select value={groupForm.key} onChange={e => setGroupForm(f => ({ ...f, key: e.target.value }))} disabled={groupForm.id > 0}>
                      <option value="best-sellers">best-sellers</option>
                      <option value="most-popular">most-popular</option>
                      <option value="new-arrivals">new-arrivals</option>
                    </Select>
                  </Field>
                  <Field label="Group Name"><Input value={groupForm.name} onChange={e => setGroupForm(f => ({ ...f, name: e.target.value }))} required /></Field>
                  <Field label="Active">
                    <Select value={String(groupForm.isActive)} onChange={e => setGroupForm(f => ({ ...f, isActive: e.target.value === 'true' }))}>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </Select>
                  </Field>
                  <div className={styles.fullWidth}>
                    <Label>Pick Products</Label>
                    <div className={styles.productListBox}>
                      {products.map(p => (
                        <label key={p.id} className={styles.productPick}>
                          <input
                            type="checkbox"
                            checked={groupForm.productIds.includes(p.id)}
                            onChange={(e) => {
                              setGroupForm(f => ({
                                ...f,
                                productIds: e.target.checked
                                  ? [...f.productIds, p.id]
                                  : f.productIds.filter(id => id !== p.id),
                              }));
                            }}
                          />
                          <span>#{p.id} {p.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className={`${styles.actions} ${styles.fullWidth}`}>
                    <Button type="submit" loading={busy === 'save-group'}>Save Group</Button>
                    <Button variant="ghost" type="button" onClick={() => setGroupForm({ id: 0, key: 'best-sellers', name: '', isActive: true, productIds: [] })}>Clear</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Group List</CardTitle><CardDescription>Manage homepage group membership.</CardDescription></CardHeader>
              <CardContent>
                <div className={styles.searchBar}>
                  <Search size={15} />
                  <Input placeholder="Search groups by name or key…" value={groupSearch} onChange={e => setGroupSearch(e.target.value)} />
                </div>
                <TableWrap>
                  <Table>
                    <thead><tr><TH>ID</TH><TH>Key</TH><TH>Name</TH><TH>Products</TH><TH>Actions</TH></tr></thead>
                    <tbody>
                      {loading ? (
                        <SkeletonRows cols={5} />
                      ) : groupTableResult.pageItems.length === 0 ? (
                        <tr><TD colSpan={5}>No groups found.</TD></tr>
                      ) : groupTableResult.pageItems.map(g => (
                        <tr key={g.id}>
                          <TD>{g.id}</TD><TD><Badge variant="secondary">{g.key}</Badge></TD><TD>{g.name}</TD><TD>{g.productIds.join(', ')}</TD>
                          <TD>
                            <div className={styles.actions}>
                              <Button size="sm" variant="outline" onClick={() => editGroup(g)}>Edit</Button>
                              <Button size="sm" variant="destructive" loading={busy === `delete-group-${g.id}`} onClick={() => setConfirmDelete({ type: 'group', id: g.id, label: g.name })}>Delete</Button>
                            </div>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrap>
                <AdminPagination
                  page={groupTableResult.page}
                  totalPages={groupTableResult.totalPages}
                  totalCount={groupTableResult.totalCount}
                  pageSize={ADMIN_PAGE_SIZE}
                  onPageChange={setGroupTablePage}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'orders' && (
          <div className={styles.panelGrid}>
            <Card>
              <CardHeader><CardTitle>Orders</CardTitle><CardDescription>Update status and admin notes for incoming orders.</CardDescription></CardHeader>
              <CardContent>
                <div className={styles.searchBar}>
                  <Search size={15} />
                  <Input placeholder="Search orders by ID, customer name, email, or phone…" value={orderSearch} onChange={e => setOrderSearch(e.target.value)} />
                </div>
                <TableWrap>
                  <Table>
                    <thead><tr><TH>Order #</TH><TH>Customer</TH><TH>Shipping Address</TH><TH>Total</TH><TH>Status</TH><TH>Notes</TH><TH>Actions</TH></tr></thead>
                    <tbody>
                      {orderTableLoading ? (
                        <SkeletonRows cols={7} />
                      ) : orderTable.items.length === 0 ? (
                        <tr><TD colSpan={7}>No orders found.</TD></tr>
                      ) : orderTable.items.map(o => (
                        <OrderRow key={o.id} order={o} saving={busy === `save-order-${o.id}`} onSave={updateOrder} />
                      ))}
                    </tbody>
                  </Table>
                </TableWrap>
                <AdminPagination
                  page={orderTablePage}
                  totalPages={orderTable.totalPages}
                  totalCount={orderTable.totalCount}
                  pageSize={ADMIN_PAGE_SIZE}
                  onPageChange={setOrderTablePage}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Confirm deletion"
          message={confirmDeleteLabel(confirmDelete)}
          loading={busy === `delete-${confirmDelete.type}-${confirmDelete.id}`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className={styles.metricCard}>
        <div className={styles.metricIcon}>{icon}</div>
        <div>
          <div className={styles.metricValue}>{value}</div>
          <div className={styles.metricLabel}>{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SkeletonRows({ rows = 4, cols }: { rows?: number; cols: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={`skeleton-row-${r}`}>
          {Array.from({ length: cols }).map((_, c) => (
            <TD key={`skeleton-cell-${r}-${c}`}><Skeleton width={c === cols - 1 ? '4rem' : '80%'} /></TD>
          ))}
        </tr>
      ))}
    </>
  );
}

function OrderRow({
  order,
  saving,
  onSave,
}: {
  order: OrderDto;
  saving: boolean;
  onSave: (id: number, status: string, notes?: string, adminNotes?: string) => Promise<void>;
}) {
  const [status, setStatus] = useState(order.status);
  const [adminNotes, setAdminNotes] = useState(order.adminNotes ?? order.notes ?? '');

  const orderNum = order.orderNumber
    ? (order.orderNumber.startsWith('#') ? order.orderNumber : `#${order.orderNumber}`)
    : `#ET-${String(order.id).padStart(6, '0')}`;

  const createdDate = order.createdAt ? new Date(order.createdAt) : null;

  return (
    <tr>
      <TD>
        <div className={styles.orderNumBadge}>{orderNum}</div>
        <div className={styles.muted} style={{ fontSize: '0.75rem', marginTop: 2 }}>ID: #{order.id}</div>
        {createdDate && (
          <div className={styles.muted} style={{ fontSize: '0.75rem' }}>
            {createdDate.toLocaleDateString()} {createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </TD>
      <TD>
        <strong>{order.customer?.fullName || order.shippingAddress?.fullName}</strong>
        <div className={styles.muted}>{order.customer?.email || 'No email'}</div>
        <div className={styles.muted}>{order.customer?.phone || order.shippingAddress?.phone}</div>
      </TD>
      <TD>
        <div className={styles.addressBlock}>
          <div className={styles.streetAddress}>{order.shippingAddress?.address || 'No street address'}</div>
          <div className={styles.cityStateZip}>
            {[
              order.shippingAddress?.city,
              order.shippingAddress?.state,
              order.shippingAddress?.postalCode,
            ]
              .filter(Boolean)
              .join(', ')}
          </div>
          {order.shippingAddress?.country && (
            <div className={styles.muted} style={{ fontSize: '0.78rem' }}>
              {order.shippingAddress.country}
            </div>
          )}
        </div>
      </TD>
      <TD>
        <div style={{ fontWeight: 600 }}>৳{order.totalAmount.toLocaleString()}</div>
        {order.paymentMethod && (
          <div style={{ marginTop: 3 }}>
            <Badge variant="secondary">{order.paymentMethod.toUpperCase()}</Badge>
          </div>
        )}
        <div className={styles.muted} style={{ fontSize: '0.75rem', marginTop: 2 }}>
          {order.items?.length ?? 0} item{(order.items?.length ?? 0) === 1 ? '' : 's'}
        </div>
      </TD>
      <TD>
        <Select value={status} onChange={e => setStatus(e.target.value)}>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
      </TD>
      <TD>
        <div className={styles.notesContainer}>
          {order.notes && (
            <div className={styles.customerNoteBox}>
              <span className={styles.customerNoteLabel}>Customer Note:</span>
              <span>{order.notes}</span>
            </div>
          )}
          <Textarea
            rows={2}
            placeholder="Admin internal notes…"
            value={adminNotes}
            onChange={e => setAdminNotes(e.target.value)}
          />
        </div>
      </TD>
      <TD>
        <Button size="sm" loading={saving} onClick={() => onSave(order.id, status, order.notes, adminNotes)}>Save</Button>
      </TD>
    </tr>
  );
}
