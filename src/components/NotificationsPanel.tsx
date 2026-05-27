import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { fetchTopDeals, fetchStores, getRedirectUrl, CheapSharkDeal, CheapSharkStore } from '../services/cheapSharkApi'

interface EnrichedDeal extends CheapSharkDeal {
  storeName: string
  storeIcon: string
}

interface Props {
  onClose: () => void
}

export function NotificationsPanel({ onClose }: Props) {
  const [deals, setDeals] = useState<EnrichedDeal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [rawDeals, stores] = await Promise.all([fetchTopDeals(12), fetchStores()])
      const storeMap = new Map<string, CheapSharkStore>(stores.map(s => [s.storeID, s]))
      const enriched = rawDeals.map(deal => {
        const store = storeMap.get(deal.storeID)
        return {
          ...deal,
          storeName: store?.storeName ?? 'Unknown Store',
          storeIcon: store ? `https://www.cheapshark.com${store.images.icon}` : '',
        }
      })
      setDeals(enriched)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="absolute top-full right-0 mt-2 w-96 bg-[#2a0838] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div>
          <h3 className="font-roboto font-semibold text-white text-sm">Current Sales & Deals</h3>
          <p className="font-roboto text-white/35 text-[10px] mt-0.5">Top-rated deals right now</p>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Deals list */}
      <div className="max-h-[460px] overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-6 h-6 border-2 border-[#773877] border-t-transparent rounded-full animate-spin" />
            <p className="font-roboto text-white/30 text-xs">Fetching latest deals…</p>
          </div>
        ) : deals.length === 0 ? (
          <p className="text-white/40 text-sm font-roboto text-center py-12">No deals found</p>
        ) : (
          deals.map(deal => {
            const savings = Math.round(parseFloat(deal.savings))
            const isOnSale = deal.isOnSale === '1' && savings > 0
            return (
              <a
                key={deal.dealID}
                href={getRedirectUrl(deal.dealID)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group"
              >
                {/* Thumbnail */}
                <img
                  src={deal.thumb}
                  alt={deal.title}
                  className="w-14 h-10 rounded object-cover shrink-0 bg-white/10"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-roboto text-white text-xs font-medium truncate group-hover:text-[#c77fc7] transition-colors">
                    {deal.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {deal.storeIcon && (
                      <img src={deal.storeIcon} alt={deal.storeName} className="w-3.5 h-3.5 object-contain" />
                    )}
                    <span className="font-roboto text-white/35 text-[10px]">{deal.storeName}</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex flex-col items-end shrink-0 gap-0.5">
                  <div className="flex items-center gap-1.5">
                    {isOnSale && (
                      <span className="bg-green-500/20 text-green-400 text-[9px] font-roboto font-bold px-1.5 py-0.5 rounded-full">
                        -{savings}%
                      </span>
                    )}
                    <span className="font-roboto font-bold text-green-400 text-xs">
                      {parseFloat(deal.salePrice) === 0 ? 'FREE' : `$${deal.salePrice}`}
                    </span>
                  </div>
                  {isOnSale && (
                    <span className="font-roboto text-white/25 text-[10px] line-through">
                      ${deal.normalPrice}
                    </span>
                  )}
                </div>
              </a>
            )
          })
        )}
      </div>

      <div className="px-4 py-2 border-t border-white/10 text-center">
        <p className="font-roboto text-white/25 text-[10px]">Powered by CheapShark</p>
      </div>
    </div>
  )
}
