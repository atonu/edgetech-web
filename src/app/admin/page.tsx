'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Boxes, FolderTree, PackageSearch, RefreshCcw, ShoppingBag, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  adminProductGroupsApi,
  adminServicesApi,
  brandsApi,
  categoriesApi,
  ordersApi,
  productsApi,
  CategoryDto,
  BrandDto,
  ProductDto,
  ProductGroupDto,
  ProductListDto,
  ServiceItemDto,
  OrderDto,
} from '@/lib/api';
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
import { useAuthStore } from '@/store/useAuthStore';
import styles from './admin.module.css';

type TabKey = 'products' | 'categories' | 'brands' | 'services' | 'orders' | 'groups';

const ORDER_STATUSES = ['Placed', 'Verified', 'InProgress', 'Done', 'Cancelled'] as const;

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuthStore();
  const [tab, setTab] = useState<TabKey>('products');
  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState<ProductListDto[]>([]);
  const [productDetails, setProductDetails] = useState<ProductDto | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [brands, setBrands] = useState<BrandDto[]>([]);
  const [services, setServices] = useState<ServiceItemDto[]>([]);
  const [orders, setOrders] = useState<OrderDto[]>([]);
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

  const [categoryForm, setCategoryForm] = useState({ id: 0, name: '', isActive: true });
  const [brandForm, setBrandForm] = useState({ id: 0, name: '', description: '', logoUrl: '', isActive: true });
  const [serviceForm, setServiceForm] = useState({ id: 0, name: '', description: '', isActive: true });
  const [groupForm, setGroupForm] = useState({ id: 0, key: 'best-sellers', name: '', isActive: true, productIds: [] as number[] });
  const canAccessAdmin = isAuthenticated && isAdmin();

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
      const [pRes, cRes, bRes, sRes, oRes, gRes] = await Promise.allSettled([
        productsApi.getAll({ page: 1, pageSize: 100 }),
        categoriesApi.getAllAdmin(),
        brandsApi.getAllAdmin(),
        adminServicesApi.getAll(),
        ordersApi.getAllOrders({ page: 1, pageSize: 100 }),
        adminProductGroupsApi.getAll(),
      ]);

      setProducts(pRes.status === 'fulfilled' ? (pRes.value.data.items ?? []) : []);
      setCategories(cRes.status === 'fulfilled' ? (cRes.value.data ?? []) : []);
      setBrands(bRes.status === 'fulfilled' ? (bRes.value.data ?? []) : []);
      setServices(sRes.status === 'fulfilled' ? (sRes.value.data ?? []) : []);
      setOrders(oRes.status === 'fulfilled' ? (oRes.value.data.items ?? []) : []);
      setGroups(gRes.status === 'fulfilled' ? (gRes.value.data ?? []) : []);

      const failed = [pRes, cRes, bRes, sRes, oRes, gRes].filter(r => r.status === 'rejected').length;
      if (failed > 0) toast.error(`Some admin data failed to load (${failed}). Showing available data.`);
    } catch {
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
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

  if (!canAccessAdmin) return null;

  const resetProductForm = () => {
    setProductDetails(null);
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

  const editProduct = async (slug: string) => {
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
    } catch {
      toast.error('Failed to load product details.');
    }
  };

  const saveProduct = async (e: FormEvent) => {
    e.preventDefault();
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
        await productsApi.create(payload);
        toast.success('Product created.');
      }

      resetProductForm();
      await loadCore();
    } catch {
      toast.error('Failed to save product.');
    }
  };

  const removeProduct = async (id: number) => {
    try {
      await productsApi.delete(id);
      toast.success('Product removed.');
      await loadCore();
    } catch {
      toast.error('Failed to remove product.');
    }
  };

  const saveCategory = async (e: FormEvent) => {
    e.preventDefault();
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
  };

  const saveBrand = async (e: FormEvent) => {
    e.preventDefault();
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
  };

  const saveService = async (e: FormEvent) => {
    e.preventDefault();
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
  };

  const saveGroup = async (e: FormEvent) => {
    e.preventDefault();
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
  };

  const updateOrder = async (id: number, status: string, notes: string) => {
    try {
      await ordersApi.updateAdmin(id, status, notes);
      toast.success('Order updated.');
      await loadCore();
    } catch {
      toast.error('Failed to update order.');
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
              <Button variant="secondary" onClick={loadCore} disabled={loading}>
                <RefreshCcw size={16} /> Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className={styles.metrics}>
          <Metric icon={<Boxes size={16} />} label="Products" value={products.length} />
          <Metric icon={<FolderTree size={16} />} label="Categories" value={flatCategories.length} />
          <Metric icon={<Wrench size={16} />} label="Services" value={services.length} />
          <Metric icon={<ShoppingBag size={16} />} label="Orders" value={orders.length} />
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
                    <Button type="submit">Save Product</Button>
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
                <TableWrap>
                  <Table>
                    <thead><tr><TH>ID</TH><TH>Name</TH><TH>Category</TH><TH>Brand</TH><TH>Price</TH><TH>Stock</TH><TH>Actions</TH></tr></thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id}>
                          <TD>{p.id}</TD><TD>{p.name}</TD><TD>{p.categoryName}</TD><TD>{p.brandName}</TD>
                          <TD>{(p.discountPrice ?? p.price).toLocaleString()}</TD><TD>{p.stock}</TD>
                          <TD>
                            <div className={styles.actions}>
                              <Button size="sm" variant="outline" onClick={() => editProduct(p.slug)}>Edit</Button>
                              <Button size="sm" variant="destructive" onClick={() => removeProduct(p.id)}>Delete</Button>
                            </div>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrap>
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'categories' && (
          <div className={styles.panelGrid}>
            <Card>
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
                    <Button type="submit">Save Category</Button>
                    <Button variant="ghost" type="button" onClick={() => setCategoryForm({ id: 0, name: '', isActive: true })}>Clear</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Category List</CardTitle><CardDescription>Browse and maintain existing categories.</CardDescription></CardHeader>
              <CardContent>
                <TableWrap>
                  <Table>
                    <thead><tr><TH>ID</TH><TH>Name</TH><TH>Status</TH><TH>Actions</TH></tr></thead>
                    <tbody>
                      {flatCategories.map(c => (
                        <tr key={c.id}>
                          <TD>{c.id}</TD><TD>{c.name}</TD><TD><Badge variant={c.isActive ? 'success' : 'secondary'}>{c.isActive ? 'Active' : 'Inactive'}</Badge></TD>
                          <TD>
                            <div className={styles.actions}>
                              <Button size="sm" variant="outline" onClick={() => setCategoryForm({ id: c.id, name: c.name, isActive: c.isActive })}>Edit</Button>
                              <Button size="sm" variant="destructive" onClick={async () => { await categoriesApi.delete(c.id); await loadCore(); }}>Delete</Button>
                            </div>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrap>
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'brands' && (
          <div className={styles.panelGrid}>
            <Card>
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
                    <Button type="submit">Save Brand</Button>
                    <Button variant="ghost" type="button" onClick={() => setBrandForm({ id: 0, name: '', description: '', logoUrl: '', isActive: true })}>Clear</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Brand List</CardTitle><CardDescription>Existing brands from database.</CardDescription></CardHeader>
              <CardContent>
                <TableWrap>
                  <Table>
                    <thead><tr><TH>ID</TH><TH>Name</TH><TH>Status</TH><TH>Actions</TH></tr></thead>
                    <tbody>
                      {brands.map(b => (
                        <tr key={b.id}>
                          <TD>{b.id}</TD>
                          <TD>{b.name}</TD>
                          <TD><Badge variant={b.isActive ? 'success' : 'secondary'}>{b.isActive ? 'Active' : 'Inactive'}</Badge></TD>
                          <TD>
                            <div className={styles.actions}>
                              <Button size="sm" variant="outline" onClick={() => setBrandForm({ id: b.id, name: b.name, description: b.description ?? '', logoUrl: b.logoUrl ?? '', isActive: b.isActive })}>Edit</Button>
                              <Button size="sm" variant="destructive" onClick={async () => { await brandsApi.delete(b.id); await loadCore(); }}>Delete</Button>
                            </div>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrap>
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'services' && (
          <div className={styles.panelGrid}>
            <Card>
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
                    <Button type="submit">Save Service</Button>
                    <Button variant="ghost" type="button" onClick={() => setServiceForm({ id: 0, name: '', description: '', isActive: true })}>Clear</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Services List</CardTitle><CardDescription>Manage active and inactive services.</CardDescription></CardHeader>
              <CardContent>
                <TableWrap>
                  <Table>
                    <thead><tr><TH>ID</TH><TH>Name</TH><TH>Description</TH><TH>Status</TH><TH>Actions</TH></tr></thead>
                    <tbody>
                      {services.map(s => (
                        <tr key={s.id}>
                          <TD>{s.id}</TD><TD>{s.name}</TD><TD>{s.description}</TD>
                          <TD><Badge variant={s.isActive ? 'success' : 'secondary'}>{s.isActive ? 'Active' : 'Inactive'}</Badge></TD>
                          <TD>
                            <div className={styles.actions}>
                              <Button size="sm" variant="outline" onClick={() => setServiceForm({ id: s.id, name: s.name, description: s.description ?? '', isActive: s.isActive })}>Edit</Button>
                              <Button size="sm" variant="destructive" onClick={async () => { await adminServicesApi.delete(s.id); await loadCore(); }}>Delete</Button>
                            </div>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrap>
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'groups' && (
          <div className={styles.panelGrid}>
            <Card>
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
                    <Button type="submit">Save Group</Button>
                    <Button variant="ghost" type="button" onClick={() => setGroupForm({ id: 0, key: 'best-sellers', name: '', isActive: true, productIds: [] })}>Clear</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Group List</CardTitle><CardDescription>Manage homepage group membership.</CardDescription></CardHeader>
              <CardContent>
                <TableWrap>
                  <Table>
                    <thead><tr><TH>ID</TH><TH>Key</TH><TH>Name</TH><TH>Products</TH><TH>Actions</TH></tr></thead>
                    <tbody>
                      {groups.map(g => (
                        <tr key={g.id}>
                          <TD>{g.id}</TD><TD><Badge variant="secondary">{g.key}</Badge></TD><TD>{g.name}</TD><TD>{g.productIds.join(', ')}</TD>
                          <TD>
                            <div className={styles.actions}>
                              <Button size="sm" variant="outline" onClick={() => setGroupForm({ id: g.id, key: g.key, name: g.name, isActive: g.isActive, productIds: g.productIds })}>Edit</Button>
                              <Button size="sm" variant="destructive" onClick={async () => { await adminProductGroupsApi.delete(g.id); await loadCore(); }}>Delete</Button>
                            </div>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrap>
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'orders' && (
          <Card>
            <CardHeader><CardTitle>Orders</CardTitle><CardDescription>Update status and admin notes for incoming orders.</CardDescription></CardHeader>
            <CardContent>
              <TableWrap>
                <Table>
                  <thead><tr><TH>ID</TH><TH>Customer</TH><TH>Total</TH><TH>Status</TH><TH>Notes</TH><TH>Actions</TH></tr></thead>
                  <tbody>
                    {orders.map(o => (
                      <OrderRow key={o.id} order={o} onSave={updateOrder} />
                    ))}
                  </tbody>
                </Table>
              </TableWrap>
            </CardContent>
          </Card>
        )}
      </div>
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

function OrderRow({ order, onSave }: { order: OrderDto; onSave: (id: number, status: string, notes: string) => Promise<void> }) {
  const [status, setStatus] = useState(order.status);
  const [notes, setNotes] = useState(order.notes ?? '');

  return (
    <tr>
      <TD>#{order.id}</TD>
      <TD>
        <strong>{order.customer?.fullName || order.shippingAddress.fullName}</strong>
        <div className={styles.muted}>{order.customer?.email || 'No email'}</div>
        <div className={styles.muted}>{order.customer?.phone || order.shippingAddress.phone}</div>
      </TD>
      <TD>{order.totalAmount.toLocaleString()}</TD>
      <TD>
        <Select value={status} onChange={e => setStatus(e.target.value)}>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
      </TD>
      <TD>
        <Textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
      </TD>
      <TD>
        <Button size="sm" onClick={() => onSave(order.id, status, notes)}>Save</Button>
      </TD>
    </tr>
  );
}
