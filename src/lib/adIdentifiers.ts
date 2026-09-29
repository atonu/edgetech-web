export interface AdIdentifiers {
  fbp: string | null;
  fbc: string | null;
  gaClientId: string | null;
  gclid: string | null;
}

export function captureClickIds() {
  if (typeof window === 'undefined') return;

  const gclid = new URLSearchParams(window.location.search).get('gclid');
  if (gclid) sessionStorage.setItem('etx_gclid', gclid);
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const cookie = document.cookie
    .split('; ')
    .find(value => value.startsWith(`${name}=`));

  if (!cookie) return null;

  const value = cookie.slice(name.length + 1);
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function adIdentifiers(): AdIdentifiers {
  if (typeof document === 'undefined') {
    return { fbp: null, fbc: null, gaClientId: null, gclid: null };
  }

  const ga = readCookie('_ga');

  return {
    fbp: readCookie('_fbp'),
    fbc: readCookie('_fbc'),
    gaClientId: ga ? ga.split('.').slice(-2).join('.') : null,
    gclid: sessionStorage.getItem('etx_gclid'),
  };
}
