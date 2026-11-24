export const BRAND_ASSET_VERSION = '20261123';

export const BRAND_LOGO_SVG = '/assets/aistudio/logo.svg';
export const BRAND_LOGO_MASTER = BRAND_LOGO_SVG;
export const BRAND_LOGO_MAIN = BRAND_LOGO_SVG;
export const BRAND_LOGO_COMPACT = BRAND_LOGO_SVG;
export const BRAND_FAVICON_ICO = BRAND_LOGO_SVG;
export const BRAND_OG_IMAGE = `/og.jpg?v=${BRAND_ASSET_VERSION}`;

const LEGACY_LOCAL_LOGO_PATHS = new Set([
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/brand/aman-logo.png',
  '/brand/aman-logo-compact.png',
  '/brand/aman-logo-master.png',
  '/assets/aistudio/22258_70e2ad05.png',
]);

const LEGACY_LOCAL_FAVICON_PATHS = new Set([
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
  '/brand/aman-logo.png',
  '/brand/aman-logo-compact.png',
  '/brand/aman-logo-master.png',
  '/assets/aistudio/22258_70e2ad05.png',
]);

const LEGACY_UPLOADED_LOGO_PATTERNS = [
  /1794752550523_aman_computer_logo/i,
  /1794752567070_aman_computer_logo/i,
  /\/aman_computer_logo\.(jpe?g|png|webp)$/i,
  /\/brand\/aman-logo[^/]*\.(png|jpe?g|webp|svg)$/i,
  /\/assets\/aistudio\/22258_70e2ad05\.png$/i,
];

const LEGACY_DEFAULT_OG_IMAGES = new Set([
  '',
  '/og.jpg',
  '/og.jpg?v=2',
  '/og.jpg?v=22258',
]);

function extractNormalizedPath(url: string): string {
  const clean = url.split('#')[0].split('?')[0].trim();
  if (!clean) return '';
  try {
    if (/^https?:\/\//i.test(clean)) {
      return new URL(clean).pathname.toLowerCase();
    }
  } catch {
    // Fall back to string normalization below
  }
  const withoutDot = clean.replace(/^\.+/, '');
  return (withoutDot.startsWith('/') ? withoutDot : `/${withoutDot}`).toLowerCase();
}

export function isLegacyLogoUrl(url?: string | null): boolean {
  const trimmed = String(url || '').trim();
  if (!trimmed) return true;
  if (/^data:image\//i.test(trimmed)) return false;
  const pathname = extractNormalizedPath(trimmed);
  if (pathname === BRAND_LOGO_SVG.toLowerCase()) return false;
  if (LEGACY_LOCAL_LOGO_PATHS.has(pathname)) return true;
  return LEGACY_UPLOADED_LOGO_PATTERNS.some((re) => re.test(pathname));
}

export function isLegacyFaviconUrl(url?: string | null): boolean {
  const trimmed = String(url || '').trim();
  if (!trimmed) return true;
  if (/^data:image\//i.test(trimmed)) return false;
  const pathname = extractNormalizedPath(trimmed);
  if (pathname === BRAND_LOGO_SVG.toLowerCase()) return false;
  if (LEGACY_LOCAL_FAVICON_PATHS.has(pathname)) return true;
  return LEGACY_UPLOADED_LOGO_PATTERNS.some((re) => re.test(pathname));
}

export function normalizeBrandLogoUrl(url?: string | null, _compact = false): string {
  const trimmed = String(url || '').trim();
  if (isLegacyLogoUrl(trimmed)) {
    return BRAND_LOGO_SVG;
  }
  const pathname = extractNormalizedPath(trimmed);
  if (pathname === BRAND_LOGO_SVG.toLowerCase()) {
    return BRAND_LOGO_SVG;
  }
  return trimmed;
}

export function normalizeFaviconUrl(url?: string | null): string {
  const trimmed = String(url || '').trim();
  if (isLegacyFaviconUrl(trimmed)) {
    return BRAND_FAVICON_ICO;
  }
  const pathname = extractNormalizedPath(trimmed);
  if (pathname === BRAND_LOGO_SVG.toLowerCase()) {
    return BRAND_FAVICON_ICO;
  }
  return trimmed;
}

export function normalizeOgImageUrl(url?: string | null): string {
  const trimmed = String(url || '').trim();
  if (!trimmed || LEGACY_DEFAULT_OG_IMAGES.has(trimmed)) {
    return BRAND_OG_IMAGE;
  }
  return trimmed;
}

export function sanitizeWebsiteBrandAndSeo<
  T extends {
    brandSettings?: { logoUrl?: string; faviconUrl?: string } & Record<string, any>;
    seoSettings?: { ogImageUrl?: string } & Record<string, any>;
  },
>(content: T): T {
  if (!content || typeof content !== 'object') return content;
  return {
    ...content,
    ...(content.brandSettings
      ? {
          brandSettings: {
            ...content.brandSettings,
            logoUrl: normalizeBrandLogoUrl(content.brandSettings.logoUrl, false),
            faviconUrl: normalizeFaviconUrl(content.brandSettings.faviconUrl),
          },
        }
      : {}),
    ...(content.seoSettings
      ? {
          seoSettings: {
            ...content.seoSettings,
            ogImageUrl: normalizeOgImageUrl(content.seoSettings.ogImageUrl),
          },
        }
      : {}),
  };
}

export function sanitizeMediaAssets<
  T extends { id?: string; name?: string; url?: string; category?: string },
>(assets: T[]): T[] {
  if (!Array.isArray(assets)) return assets;
  return assets.map((asset) => {
    if (!asset || typeof asset !== 'object') return asset;
    if (isLegacyLogoUrl(asset.url)) {
      return {
        ...asset,
        url: BRAND_LOGO_SVG,
        ...(asset.id === 'med-1' || asset.category === 'logo'
          ? { name: 'Aman_Computer_Logo.svg' }
          : {}),
      };
    }
    if (asset.url && LEGACY_DEFAULT_OG_IMAGES.has(asset.url.trim())) {
      return {
        ...asset,
        url: BRAND_OG_IMAGE,
      };
    }
    return asset;
  });
}
