'use client';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/gtm';

/** Coarse bucket so GTM/GA4 can segment "landed on products" without regex on the path. */
function pageTypeOf(pathname: string): string {
  if (pathname === '/') return 'home';
  if (pathname === '/checkout/success') return 'purchase';
  if (pathname.startsWith('/checkout')) return 'checkout';
  if (pathname.startsWith('/products/')) return 'product';
  if (pathname === '/products' || pathname.startsWith('/category')) return 'products';
  if (pathname === '/cart') return 'cart';
  if (pathname.startsWith('/search')) return 'search';
  if (pathname.startsWith('/package-builder')) return 'package_builder';
  if (pathname.startsWith('/auth')) return 'auth';
  if (pathname.startsWith('/account')) return 'account';
  if (pathname.startsWith('/admin')) return 'admin';
  return 'content';
}

/**
 * The App Router navigates client-side, so the GTM container only ever sees the first
 * page. This pushes a `page_view` on every route AND query-string change — which is what
 * makes the per-step checkout URLs countable.
 */
export default function RouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    trackPageView({
      path: query ? `${pathname}?${query}` : pathname,
      route: pathname,
      title: document.title,
      pageType: pageTypeOf(pathname),
    });
  }, [pathname, query]);

  return null;
}
