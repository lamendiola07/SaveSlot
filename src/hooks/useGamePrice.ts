import { useState, useEffect } from 'react';
import { Game } from '../types/game';
import { fetchBestDealForTitle, fetchStores } from '../services/cheapSharkApi';
import { getOfficialStoreLink } from '../services/platformStores';

// Simple in-memory cache to avoid redundant API calls during the session
const priceCache: Record<string, Partial<Game>> = {};

export function useGamePrice(title: string, platforms: string[] = []) {
  const [pricing, setPricing] = useState<Partial<Game> | null>(priceCache[title] || null);
  const [loading, setLoading] = useState(!priceCache[title]);

  useEffect(() => {
    if (priceCache[title]) {
      setPricing(priceCache[title]);
      setLoading(false);
      return;
    }

    async function enrichPrice() {
      setLoading(true);
      try {
        const [deal, stores] = await Promise.all([
          fetchBestDealForTitle(title),
          fetchStores()
        ]);

        if (deal) {
          const store = stores.find(s => s.storeID === deal.storeID);
          const pricingData: Partial<Game> = {
            cheapestPrice: `$${deal.salePrice}`,
            normalPrice: `$${deal.normalPrice}`,
            isOnSale: parseFloat(deal.savings) > 0,
            savings: deal.savings === '0' ? undefined : `${Math.round(parseFloat(deal.savings))}% OFF`,
            dealLink: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
            storeName: store?.storeName,
            storeIcon: store ? `https://www.cheapshark.com${store.images.icon}` : undefined,
          };
          
          priceCache[title] = pricingData;
          setPricing(pricingData);
        } else {
          // If no CheapShark deal, look for official store bridge
          const officialStore = getOfficialStoreLink(platforms, title);
          if (officialStore) {
            const pricingData: Partial<Game> = {
              dealLink: officialStore.link,
              storeName: officialStore.name,
              storeIcon: officialStore.icon,
              cheapestPrice: 'Official Store'
            };
            priceCache[title] = pricingData;
            setPricing(pricingData);
          } else {
            priceCache[title] = {};
            setPricing({});
          }
        }
      } catch (error) {
        console.error('Error enriching price:', error);
      } finally {
        setLoading(false);
      }
    }

    enrichPrice();
  }, [title, platforms]);

  return { pricing, loading };
}
