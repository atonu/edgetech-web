/**
 * Self-check for the cart -> dataLayer event logic (the only non-obvious part: the delta math).
 * Run from edgetech-web/:  npx tsx src/lib/gtm.check.ts
 */
import assert from 'node:assert';

interface DlItem { item_id: string; item_name: string; item_brand?: string; item_category?: string; price: number; discount?: number; quantity: number }
interface DlEvent { event?: string; add_source?: string; user_type?: string; ecommerce: { items: DlItem[]; value: number; currency: string } | null }

async function main() {
  // gtm.ts no-ops during SSR, so give it a window before importing the store.
  const g = globalThis as unknown as {
    window: { location: { href: string }; dataLayer?: DlEvent[]; localStorage: Storage };
    localStorage: Storage;
  };
  // zustand's persist middleware reads window.localStorage; nothing here reads it back.
  const store = new Map<string, string>();
  const fakeStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    get length() { return store.size; },
  } as Storage;
  g.localStorage = fakeStorage;
  g.window = { location: { href: 'http://test.local/' }, localStorage: fakeStorage };

  const { useCartStore } = await import('@/store/useCartStore');

  const dl = () => (window as unknown as { dataLayer?: DlEvent[] }).dataLayer ?? [];
  const events = () => dl().filter(e => e.event).map(e => e.event as string);
  const lastOf = (name: string) => [...dl()].reverse().find(e => e.event === name) as DlEvent;
  const itemsOf = (name: string) => (lastOf(name).ecommerce as { items: DlItem[] }).items;

  const cam = {
    id: 7, name: 'Dahua 4MP Bullet', slug: 'dahua-4mp', price: 10000, discountPrice: 8000,
    stock: 50, isFeatured: true, categoryName: 'IP Camera', brandName: 'Dahua',
  };

  // 1. Adding 2 units emits ONE add_to_cart carrying quantity 2 — not two events.
  useCartStore.getState().addItem(cam, 2, 'product_detail');
  assert.deepStrictEqual(events(), ['add_to_cart'], 'one event per add, regardless of quantity');

  const add = lastOf('add_to_cart');
  assert.strictEqual(add.add_source, 'product_detail');
  assert.strictEqual(add.user_type, 'guest', 'anonymous visitors are still attributed');
  assert.deepStrictEqual(itemsOf('add_to_cart')[0], {
    item_id: '7', item_name: 'Dahua 4MP Bullet', item_brand: 'Dahua', item_category: 'IP Camera',
    price: 8000, discount: 2000, quantity: 2,
  });
  assert.strictEqual(add.ecommerce!.value, 16000, 'value uses the discounted price');
  assert.strictEqual(add.ecommerce!.currency, 'BDT');

  // 2. ecommerce is nulled before each ecommerce event, so items never leak between events.
  assert.strictEqual(dl()[0].ecommerce, null, 'ecommerce reset pushed first');

  // 3. Stepping quantity up reports the DELTA (+3), not the new total (5).
  useCartStore.getState().updateQuantity(7, 5);
  assert.strictEqual(itemsOf('add_to_cart')[0].quantity, 3, 'increase reports delta');

  // 4. Stepping down reports a remove of the delta (2).
  useCartStore.getState().updateQuantity(7, 3);
  assert.strictEqual(itemsOf('remove_from_cart')[0].quantity, 2, 'decrease reports delta');

  // 5. A no-op quantity set emits nothing.
  const before = events().length;
  useCartStore.getState().updateQuantity(7, 3);
  assert.strictEqual(events().length, before, 'unchanged quantity emits no event');

  // 6. Removing reports the full remaining quantity.
  useCartStore.getState().removeItem(7);
  assert.strictEqual(itemsOf('remove_from_cart')[0].quantity, 3, 'remove reports what was left');
  assert.strictEqual(useCartStore.getState().items.length, 0);

  console.log('dataLayer events:', events().join(' -> '));
  console.log('OK - all cart tracking assertions passed');
}

main();
