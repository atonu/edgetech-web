export function aggregatePackageItems<T extends { productId: number; quantity: number }>(items: T[]): T[] {
  const grouped = new Map<number, T>();
  for (const item of items) {
    const existing = grouped.get(item.productId);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      grouped.set(item.productId, { ...item });
    }
  }
  return Array.from(grouped.values());
}
