// src/lib/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5217';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('et_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/auth/login?returnTo=${returnTo}`;
    }
    return Promise.reject(error);
  }
);

// Types
export interface ProductListDto {
  id: number;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  primaryImageUrl?: string;
  stock: number;
  isFeatured: boolean;
  categoryName: string;
  brandName: string;
}

export interface ProductDto extends ProductListDto {
  description?: string;
  shortDescription?: string;
  sku?: string;
  isActive: boolean;
  categoryId: number;
  categorySlug: string;
  brandId: number;
  brandSlug: string;
  images: ProductImageDto[];
  specifications: ProductSpecDto[];
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

export interface ProductImageDto {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductSpecDto {
  id: number;
  key: string;
  value: string;
  displayOrder: number;
}

export interface CategoryDto {
  id: number;
  name: string;
  isActive: boolean;
  slug?: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  parentCategoryId?: number;
  subCategories?: CategoryDto[];
}

export interface CreateCategoryRequest {
  name: string;
  isActive: boolean;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {}

export interface BrandDto {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  isActive: boolean;
}

export interface CartItemDto {
  id: number;
  productId: number;
  productName: string;
  imageUrl?: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  stock: number;
}

export interface CartDto {
  items: CartItemDto[];
  total: number;
}

export interface OrderDto {
  id: number;
  status: string;
  totalAmount: number;
  customer: CustomerInfo;
  shippingAddress: ShippingAddress;
  notes?: string;
  paymentMethod?: string;
  createdAt: string;
  items: OrderItemDto[];
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
}

export interface OrderItemDto {
  id: number;
  productId: number;
  productName: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PlaceOrderItemRequest {
  productId: number;
  quantity: number;
}

export interface PlaceOrderRequest {
  shippingAddress: ShippingAddress;
  notes?: string;
  paymentMethod: string;
  customer: CustomerInfo;
  items: PlaceOrderItemRequest[];
}

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expires: string;
  user: UserDto;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PackageSlot {
  slotKey: string;
  label: string;
  description: string;
  categorySlug: string;
  icon: string;
}

export interface PackageSlotWithProducts {
  slot: PackageSlot;
  products: ProductListDto[];
}

export interface PackageBuildDto {
  id: number;
  name: string;
  totalPrice: number;
  createdAt: string;
  components: PackageComponentDto[];
}

export interface PackageComponentDto {
  slotKey: string;
  productId: number;
  productName: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

export interface ServiceItemDto {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface ProductGroupDto {
  id: number;
  key: string;
  name: string;
  isActive: boolean;
  productIds: number[];
  updatedAt: string;
}

export interface HomeGroupsResponse {
  bestSellers: ProductListDto[];
  mostPopular: ProductListDto[];
  newArrivals: ProductListDto[];
}

// API functions
export const productsApi = {
  getAll: (params?: Record<string, unknown>) => api.get<PagedResult<ProductListDto>>('/products', { params }),
  getFeatured: (count = 8) => api.get<ProductListDto[]>('/products/featured', { params: { count } }),
  getBySlug: (slug: string) => api.get<ProductDto>(`/products/${slug}`),
  create: (data: unknown) => api.post('/products', data),
  update: (id: number, data: unknown) => api.put(`/products/${id}`, data),
  toggleFeatured: (id: number, isFeatured: boolean) => api.patch(`/products/${id}/featured`, { isFeatured }),
  delete: (id: number) => api.delete(`/products/${id}`),
  addImage: (id: number, imageUrl: string) => api.post<ProductImageDto>(`/products/${id}/images`, { imageUrl }),
  setPrimaryImage: (id: number, imageId: number) => api.patch(`/products/${id}/images/${imageId}/primary`),
  deleteImage: (id: number, imageId: number) => api.delete(`/products/${id}/images/${imageId}`),
};

// Uploads image bytes to this Next.js app's own /public folder (see src/app/api/uploads/product-images/route.ts) —
// a separate hop from `api` above, which only talks to the .NET backend.
export const productImagesApi = {
  upload: async (file: File): Promise<{ url: string }> => {
    const fd = new FormData();
    fd.append('file', file);
    const token = typeof window !== 'undefined' ? localStorage.getItem('et_token') : null;
    const res = await fetch('/api/uploads/product-images', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: fd,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || 'Image upload failed');
    }
    return res.json();
  },
  remove: async (url: string): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('et_token') : null;
    await fetch('/api/uploads/product-images', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ url }),
    });
  },
};

export const categoriesApi = {
  getAll: () => api.get<CategoryDto[]>('/categories'),
  getAllAdmin: () => api.get<CategoryDto[]>('/categories', { params: { includeInactive: true } }),
  getBySlug: (slug: string) => api.get<CategoryDto>(`/categories/${slug}`),
  create: (data: unknown) => api.post('/categories', data),
  update: (id: number, data: unknown) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

export const brandsApi = {
  getAll: () => api.get<BrandDto[]>('/brands'),
  getAllAdmin: () => api.get<BrandDto[]>('/brands', { params: { includeInactive: true } }),
  getBySlug: (slug: string) => api.get<BrandDto>(`/brands/${slug}`),
  create: (data: unknown) => api.post('/brands', data),
  update: (id: number, data: unknown) => api.put(`/brands/${id}`, data),
  delete: (id: number) => api.delete(`/brands/${id}`),
};

export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  me: () => api.get<UserDto>('/auth/me'),
};

export const cartApi = {
  get: () => api.get<CartDto>('/cart'),
  addItem: (productId: number, quantity: number) => api.post('/cart/items', { productId, quantity }),
  updateItem: (id: number, quantity: number) => api.put(`/cart/items/${id}`, { quantity }),
  removeItem: (id: number) => api.delete(`/cart/items/${id}`),
  clear: () => api.delete('/cart'),
};

export const ordersApi = {
  place: (data: PlaceOrderRequest) => api.post<{ orderId: number }>('/orders', data),
  getMyOrders: () => api.get<OrderDto[]>('/orders'),
  getOrder: (id: number) => api.get<OrderDto>(`/orders/${id}`),
  getAllOrders: (params?: Record<string, unknown>) => api.get<PagedResult<OrderDto>>('/orders/all', { params }),
  updateStatus: (id: number, status: string) => api.put(`/orders/${id}/status`, { status }),
  updateAdmin: (id: number, status: string, notes?: string) => api.put(`/orders/${id}/admin`, { status, notes }),
};

export const recentlyViewedApi = {
  track: (productId: number) => api.post(`/recently-viewed/${productId}`),
  get: () => api.get<ProductListDto[]>('/recently-viewed'),
};

export const packageBuilderApi = {
  getSlots: () => api.get<PackageSlotWithProducts[]>('/package-builder/slots'),
  save: (data: { name: string; components: { slotKey: string; productId: number; quantity: number }[] }) =>
    api.post('/package-builder/save', data),
  get: (id: number) => api.get<PackageBuildDto>(`/package-builder/${id}`),
  getMyBuilds: () => api.get<PackageBuildDto[]>('/package-builder/my-builds'),
  addToCart: (id: number) => api.post(`/package-builder/${id}/add-to-cart`),
};

export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  createUser: (data: unknown) => api.post('/admin/users', data),
  changeRole: (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
};

export const servicesApi = {
  getAll: () => api.get<ServiceItemDto[]>('/services'),
};

export const adminServicesApi = {
  getAll: () => api.get<ServiceItemDto[]>('/admin/services'),
  create: (data: { name: string; description?: string }) => api.post<ServiceItemDto>('/admin/services', data),
  update: (id: number, data: { name: string; description?: string; isActive: boolean }) => api.put(`/admin/services/${id}`, data),
  delete: (id: number) => api.delete(`/admin/services/${id}`),
};

export const productGroupsApi = {
  getHome: () => api.get<HomeGroupsResponse>('/product-groups/home'),
};

export const adminProductGroupsApi = {
  getAll: () => api.get<ProductGroupDto[]>('/admin/product-groups'),
  create: (data: { key: string; name: string; isActive: boolean; productIds: number[] }) => api.post<ProductGroupDto>('/admin/product-groups', data),
  update: (id: number, data: { name: string; isActive: boolean; productIds: number[] }) => api.put(`/admin/product-groups/${id}`, data),
  delete: (id: number) => api.delete(`/admin/product-groups/${id}`),
};
