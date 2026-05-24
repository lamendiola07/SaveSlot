export interface OfficialStore {
  name: string;
  slug: string;
  baseUrl: string;
  icon: string;
}

export const OFFICIAL_STORES: Record<string, OfficialStore> = {
  nintendo: {
    name: 'Nintendo Store',
    slug: 'nintendo',
    baseUrl: 'https://www.nintendo.com/search/#q=',
    icon: 'https://www.nintendo.com/favicon.ico'
  },
  playstation: {
    name: 'PlayStation Store',
    slug: 'playstation',
    baseUrl: 'https://store.playstation.com/search/',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/PlayStation_Store.svg'
  },
  xbox: {
    name: 'Xbox Store',
    slug: 'xbox',
    baseUrl: 'https://www.xbox.com/en-US/search?q=',
    icon: 'https://www.microsoft.com/favicon.ico'
  },
  android: {
    name: 'Google Play',
    slug: 'android',
    baseUrl: 'https://play.google.com/store/search?q=',
    icon: 'https://www.gstatic.com/android/market_images/web/favicon_v2.ico'
  },
  ios: {
    name: 'App Store',
    slug: 'ios',
    baseUrl: 'https://www.apple.com/us/search/',
    icon: 'https://www.apple.com/favicon.ico'
  }
};

export function getOfficialStoreLink(platformSlugs: string[], title: string) {
  const cleanTitle = encodeURIComponent(title.replace(/[®™]/g, '').trim());

  // Priority order: Nintendo > PlayStation > Xbox > Mobile
  if (platformSlugs.includes('nintendo')) {
    return { 
      link: `${OFFICIAL_STORES.nintendo.baseUrl}${cleanTitle}`, 
      name: OFFICIAL_STORES.nintendo.name,
      icon: OFFICIAL_STORES.nintendo.icon
    };
  }
  if (platformSlugs.includes('playstation')) {
    return { 
      link: `${OFFICIAL_STORES.playstation.baseUrl}${cleanTitle}`, 
      name: OFFICIAL_STORES.playstation.name,
      icon: OFFICIAL_STORES.playstation.icon
    };
  }
  if (platformSlugs.includes('xbox')) {
    return { 
      link: `${OFFICIAL_STORES.xbox.baseUrl}${cleanTitle}`, 
      name: OFFICIAL_STORES.xbox.name,
      icon: OFFICIAL_STORES.xbox.icon
    };
  }
  if (platformSlugs.includes('ios')) {
    return { 
      link: `${OFFICIAL_STORES.ios.baseUrl}${cleanTitle}`, 
      name: OFFICIAL_STORES.ios.name,
      icon: OFFICIAL_STORES.ios.icon
    };
  }
  if (platformSlugs.includes('android')) {
    return { 
      link: `${OFFICIAL_STORES.android.baseUrl}${cleanTitle}`, 
      name: OFFICIAL_STORES.android.name,
      icon: OFFICIAL_STORES.android.icon
    };
  }

  return null;
}
