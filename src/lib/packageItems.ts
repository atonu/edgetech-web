import type { PackageItemDto } from '@/lib/api';

export function aggregatePackageItems(items: PackageItemDto[]): PackageItemDto[] {
  const grouped = new Map<number, PackageItemDto>();
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
