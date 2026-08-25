import { useState } from 'react';

/**
 * A page-number state that snaps back to 1 whenever `resetKey` changes (e.g. a new
 * search term or filter). Adjusts during render — React's documented pattern for
 * "reset state when a prop/dependency changes" — instead of via a useEffect, since
 * calling setState synchronously inside an effect body trips this repo's stricter
 * react-hooks/set-state-in-effect lint rule.
 */
export function usePageWithReset(resetKey: string) {
  const [page, setPage] = useState(1);
  const [lastKey, setLastKey] = useState(resetKey);

  let effectivePage = page;
  if (resetKey !== lastKey) {
    setLastKey(resetKey);
    setPage(1);
    effectivePage = 1;
  }

  return [effectivePage, setPage] as const;
}
