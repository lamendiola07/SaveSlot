import { Link } from 'react-router-dom'
import { Game } from '../types/game'
import { useGamePrice } from '../hooks/useGamePrice'

interface GameCardProps {
  game: Game
}

export function GameCard({ game }: GameCardProps) {
  const { pricing, loading } = useGamePrice(game.title, game.platforms)

  // Use real-time price if available, otherwise fallback to the RAWG mock price (or a generic placeholder)
  const displayPrice = pricing?.cheapestPrice || (loading ? '...' : 'Check Price')
  const isOnSale = pricing?.isOnSale
  const savings = pricing?.savings

  return (
    <Link 
      to={`/game/${game.id}`} 
      className="flex flex-col gap-3 flex-1 min-w-0 group cursor-pointer transition-transform duration-300 hover:scale-105"
    >
      <div className="relative bg-[#eee] border-2 border-black/80 rounded overflow-hidden h-[336px] flex items-center justify-center shrink-0 group-hover:border-white transition-all shadow-lg">
        <img src={game.img} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        
        {/* Sale Badge */}
        {isOnSale && (
          <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded font-bold text-sm shadow-md z-10">
            {savings}
          </div>
        )}

        {/* Store Icon Overlay */}
        {pricing?.storeIcon && (
          <div className="absolute bottom-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-sm rounded p-1.5 z-10 border border-white/20">
            <img src={pricing.storeIcon} alt={pricing.storeName} className="w-full h-full object-contain" />
          </div>
        )}
      </div>

      <div className="font-roboto font-medium text-[15px] text-white/80 flex flex-col">
        <span className="overflow-hidden text-ellipsis whitespace-nowrap group-hover:text-white transition-colors">
          {game.title}
        </span>
        {pricing?.cheapestPrice && (
          <div className="flex items-center gap-2">
            <span className={isOnSale ? 'text-green-400 font-bold' : ''}>
              {displayPrice}
            </span>
            {isOnSale && (
              <span className="text-white/40 line-through text-xs font-normal">
                {pricing?.normalPrice}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
