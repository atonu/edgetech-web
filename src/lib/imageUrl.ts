export function getImageUrl(url?: string | null): string | null {
  if (!url) return null;
  return url.replace(/^\/product-images\//, '/api/images/');
}
