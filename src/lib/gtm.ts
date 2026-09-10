// src/lib/gtm.ts
// Every tracked action funnels through here, so GTM only ever sees one vocabulary.
// Event names follow the GA4 ecommerce spec, so in GTM you can map them straight to
// GA4 event tags without writing custom JS variables.
import type { CartItem } from '@/store/useCartStore';
import type { ProductDto, ProductListDto } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export const CURRENCY = 'BDT';

type DataLayerObject = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerObject[];
  }
}

export interface Ga4Item {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  price: number;
  discount?: number;
  quantity: number;
  index?: number;
}

/** Raw dataLayer push. No-op during SSR. */
export function gtmPush(payload: DataLayerObject) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

/** Attached to every event so GA4 can answer "how many *users* ordered", not just how many orders. */
function identity(): DataLayerObject {
  const user = useAuthStore.getState().user;
  return {
    user_id: user?.id ?? undefined,
    user_type: user ? 'registered' : 'guest',
  };
}

/**
 * ecommerce is nulled first so items from the previous event never leak into this one
 * (GTM keeps the dataLayer merged across pushes).
 */
function pushEcommerce(event: string, ecommerce: DataLayerObject, extra: DataLayerObject = {}) {
  gtmPush({ ecommerce: null });
  gtmPush({
    event,
    ...identity(),
    ...extra,
    ecommerce: { currency: CURRENCY, ...ecommerce },
  });
}

const priceOf = (p: { price: number; discountPrice?: number }) => p.discountPrice ?? p.price;

export function itemFromProduct(
  p: ProductListDto | ProductDto,
  quantity = 1,
  index?: number
): Ga4Item {
  return {
    item_id: String(p.id),
    item_name: p.name,
    item_brand: p.brandName,
    item_category: p.categoryName,
    price: priceOf(p),
    discount: p.discountPrice ? Math.round(p.price - p.discountPrice) : undefined,
    quantity,
    ...(index === undefined ? {} : { index }),
  };
}

export function itemFromCartItem(i: CartItem, quantity = i.quantity): Ga4Item {
  return {
    item_id: String(i.productId),
    item_name: i.productName,
    price: priceOf(i),
    discount: i.discountPrice ? Math.round(i.price - i.discountPrice) : undefined,
    quantity,
  };
}

const sumValue = (items: Ga4Item[]) =>
  Math.round(items.reduce((sum, i) => sum + i.price * i.quantity, 0));

// ---------------------------------------------------------------------------
// Page / navigation
// ---------------------------------------------------------------------------

/**
 * Fired on every route change including the first render. Configure the GA4 page_view
 * tag in GTM on the Custom Event trigger `page_view` (NOT "All Pages"), otherwise
 * client-side navigations are missed and the first load is counted twice.
 */
export function trackPageView(args: { path: string; route: string; title: string; pageType: string }) {
  gtmPush({
    event: 'page_view',
    ...identity(),
    page_path: args.path, // includes query string
    page_route: args.route, // pathname only — use this for clean aggregation
    page_title: args.title,
    page_type: args.pageType, // home | products | product | cart | checkout | purchase | ...
    page_location: typeof window === 'undefined' ? undefined : window.location.href,
  });
}

// ---------------------------------------------------------------------------
// Product discovery
// ---------------------------------------------------------------------------

export function trackViewItemList(listId: string, listName: string, items: Ga4Item[]) {
  if (items.length === 0) return;
  pushEcommerce('view_item_list', { item_list_id: listId, item_list_name: listName, items });
}

export function trackSelectItem(product: ProductListDto, index?: number) {
  pushEcommerce('select_item', { items: [itemFromProduct(product, 1, index)] });
}

export function trackViewItem(product: ProductDto) {
  const item = itemFromProduct(product);
  pushEcommerce('view_item', { value: item.price, items: [item] });
}

export function trackSearch(term: string, resultCount: number) {
  if (!term.trim()) return;
  gtmPush({ event: 'search', ...identity(), search_term: term.trim(), search_results: resultCount });
}

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------

export function trackAddToCart(items: Ga4Item[], source: string) {
  pushEcommerce('add_to_cart', { value: sumValue(items), items }, { add_source: source });
}

export function trackRemoveFromCart(items: Ga4Item[]) {
  pushEcommerce('remove_from_cart', { value: sumValue(items), items });
}

export function trackViewCart(items: Ga4Item[]) {
  if (items.length === 0) return;
  pushEcommerce('view_cart', { value: sumValue(items), items });
}

// ---------------------------------------------------------------------------
// Checkout funnel — one event per step, each step also has its own URL
// ---------------------------------------------------------------------------

export function trackBeginCheckout(items: Ga4Item[]) {
  pushEcommerce(
    'begin_checkout',
    { value: sumValue(items), items },
    { item_count: items.reduce((n, i) => n + i.quantity, 0) }
  );
}

export function trackAddShippingInfo(items: Ga4Item[], city: string) {
  pushEcommerce('add_shipping_info', { value: sumValue(items), shipping_tier: city, items });
}

export function trackAddPaymentInfo(items: Ga4Item[], paymentType: string) {
  pushEcommerce('add_payment_info', { value: sumValue(items), payment_type: paymentType, items });
}

export function trackPurchase(args: {
  transactionId: string;
  items: Ga4Item[];
  value: number;
  paymentMethod: string;
  isEmi: boolean;
  emiTenureMonths?: number;
  emiBank?: string;
  city: string;
}) {
  pushEcommerce(
    'purchase',
    {
      transaction_id: args.transactionId,
      value: args.value,
      shipping: 0,
      tax: 0,
      items: args.items,
    },
    {
      payment_type: args.paymentMethod,
      item_count: args.items.reduce((n, i) => n + i.quantity, 0),
      shipping_tier: args.city,
      is_emi: args.isEmi,
      emi_tenure_months: args.isEmi ? args.emiTenureMonths : undefined,
      emi_bank: args.isEmi ? args.emiBank : undefined,
    }
  );
}

export function trackCheckoutError(reason: string) {
  gtmPush({ event: 'checkout_error', ...identity(), error_reason: reason });
}

// ---------------------------------------------------------------------------
// Account & solution builder
// ---------------------------------------------------------------------------

export function trackLogin(method = 'password') {
  gtmPush({ event: 'login', ...identity(), method });
}

export function trackSignUp(method = 'password') {
  gtmPush({ event: 'sign_up', ...identity(), method });
}

export function trackPackageBuild(slotCount: number, value: number) {
  gtmPush({ event: 'package_build_added', ...identity(), slot_count: slotCount, value, currency: CURRENCY });
}
