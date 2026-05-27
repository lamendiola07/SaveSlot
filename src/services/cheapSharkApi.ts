const BASE_URL = 'https://www.cheapshark.com/api/1.0';

export interface CheapSharkDeal {
  internalName: string;
  title: string;
  metacriticLink: string;
  dealID: string;
  storeID: string;
  gameID: string;
  salePrice: string;
  normalPrice: string;
  isOnSale: string;
  savings: string;
  metacriticScore: string;
  steamRatingText: string;
  steamRatingPercent: string;
  steamRatingCount: string;
  steamAppID: string;
  releaseDate: number;
  lastChange: number;
  dealRating: string;
  thumb: string;
}

export interface CheapSharkStore {
  storeID: string;
  storeName: string;
  isActive: number;
  images: {
    banner: string;
    logo: string;
    icon: string;
  };
}

let storeCache: CheapSharkStore[] | null = null;

export async function fetchStores(): Promise<CheapSharkStore[]> {
  if (storeCache) return storeCache;
  
  try {
    const response = await fetch(`${BASE_URL}/stores`);
    if (!response.ok) throw new Error('Failed to fetch stores');
    storeCache = await response.json();
    return storeCache || [];
  } catch (error) {
    console.error('CheapShark Stores Error:', error);
    return [];
  }
}

export async function fetchBestDealForTitle(title: string): Promise<CheapSharkDeal | null> {
  try {
    // Sanitize title for URL
    const cleanTitle = title.replace(/[®™]/g, '').trim();
    const queryParams = new URLSearchParams({
      title: cleanTitle,
      exact: '0', // 0 is often better for matching RAWG titles which might have subtitles
      limit: '1'
    });

    const response = await fetch(`${BASE_URL}/deals?${queryParams.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch deals');
    
    const deals: CheapSharkDeal[] = await response.json();
    return deals.length > 0 ? deals[0] : null;
  } catch (error) {
    console.error('CheapShark Deals Error:', error);
    return null;
  }
}

export const getRedirectUrl = (dealId: string) => `https://www.cheapshark.com/redirect?dealID=${dealId}`;

export async function fetchTopDeals(pageSize = 10): Promise<CheapSharkDeal[]> {
  try {
    const params = new URLSearchParams({ sortBy: 'DealRating', pageSize: String(pageSize) })
    const res = await fetch(`${BASE_URL}/deals?${params}`)
    if (!res.ok) throw new Error('Failed to fetch top deals')
    return await res.json()
  } catch (error) {
    console.error('CheapShark Top Deals Error:', error)
    return []
  }
}
