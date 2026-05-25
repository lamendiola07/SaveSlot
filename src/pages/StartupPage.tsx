import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { Sidebar } from '../components/Sidebar'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useGames } from '../hooks/useGames'
import { useSearchStore } from '../store'
import { GameCard } from '../components/GameCard'

const BACKGROUNDS = [
  'https://www.figma.com/api/mcp/asset/b43ca7e4-f677-4796-8378-ee5d25b13689', // Minecraft
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop', // Gaming setup
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop', // Abstract gaming
]

function Pagination({ activePage, totalPages, onPageChange }: { activePage: number; totalPages: number; onPageChange: (p: number) => void }) {
  return (
    <div className="flex items-center justify-end gap-0">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          onClick={() => onPageChange(n)}
          className={`w-9 h-9 rounded flex items-center justify-center font-roboto font-medium text-[15px] transition-all ${
            n === activePage ? 'bg-black/80 text-white' : 'text-white/80 hover:bg-black/10'
          }`}
        >
          {n}
        </button>
      ))}
      <button 
        onClick={() => onPageChange(activePage + 1)}
        disabled={activePage === totalPages}
        className="w-9 h-9 rounded bg-white flex items-center justify-center border border-black/10 hover:bg-gray-100 disabled:opacity-20"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}

const whatYouCanDoCards = [
  { id: 1, title: 'Track Progress', description: 'Keep tabs on your gaming journey.', image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=700&q=90' },
  { id: 2, title: 'Connect Friends', description: 'Share your high scores and achievements.', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=700&q=90' },
  { id: 3, title: 'Discover Games', description: 'Find your next obsession easily.', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=700&q=90' },
  { id: 4, title: 'Personal Lists', description: 'Curate the perfect wishlist.', image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=700&q=90' },
  { id: 5, title: 'Game Reviews', description: 'Read and write community reviews.', image: 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=700&q=90' },
  { id: 6, title: 'Live Events', description: 'Join exclusive community tournaments.', image: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=700&q=90' },
]

export function StartupPage() {
  const [bgIndex, setBgIndex] = useState(0)
  const [upcomingPage, setUpcomingPage] = useState(1)
  const sliderRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const itemsPerPage = 4
  
  const { games: upcomingGames, loading: loadingUpcoming, totalCount: totalUpcoming } = useGames({
    page: upcomingPage,
    pageSize: itemsPerPage,
    ordering: '-released',
    dates: `2024-01-01,2026-12-31`
  })

  const { games: popularGames, loading: loadingPopular } = useGames({
    pageSize: 2,
    ordering: '-metacritic'
  })

  const totalUpcomingPages = Math.min(5, Math.ceil(totalUpcoming / itemsPerPage))

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUNDS.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2
      sliderRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-w-[1440px]">
      {/* ── Hero Section ── */}
      <section className="relative h-[810px] overflow-hidden flex flex-col">
        {BACKGROUNDS.map((bg, index) => (
          <img
            key={bg}
            src={bg}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 pointer-events-none ${
              index === bgIndex ? 'opacity-70' : 'opacity-0'
            }`}
          />
        ))}
        <Header />

        <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-12 text-center">
          <div className="max-w-[875px] mb-12">
            <div className="text-white font-roboto text-[56px] leading-[1.1] drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
              <p>Track the games you've played.</p>
              <p>Save the one's you want.</p>
              <p>Share your experience with friends.</p>
            </div>
          </div>

          <div className="w-[300px]">
            <button className="w-full h-16 bg-[#45413e] hover:bg-[#5a5653] transition-all rounded-[10px] font-roboto text-white text-2xl flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95">
              Get started - it's free!
            </button>
          </div>

          <div className="mt-8 font-roboto text-[#45413e] text-xl bg-white/30 px-6 py-2 rounded-full backdrop-blur-md">
            The social hub for gamers. Play, Share, and Discover.
          </div>
        </div>

        <div className="absolute right-8 bottom-24 flex items-center justify-center w-8 h-[185px]">
          <p className="-rotate-90 font-roboto text-white text-xl opacity-60 whitespace-pre origin-center">
            {'MINECRAFT  1.26.1'}
          </p>
        </div>
      </section>

      {/* ── Upcoming Games ── */}
      <section className="mx-auto px-[120px] py-16" style={{ maxWidth: 1440 }}>
        <div className="flex items-baseline justify-between mb-8">
          <p className="font-roboto text-2xl text-white/80 uppercase tracking-wider">Upcoming Games</p>
          <button 
            onClick={() => {
              useSearchStore.getState().clearFilters()
              navigate('/upcoming')
            }}
            className="flex items-center gap-1 font-roboto font-medium text-lg text-white/80 hover:text-white hover:underline transition-colors"
          >
            See all
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        {loadingUpcoming ? (
          <div className="grid grid-cols-4 gap-8 h-[400px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 flex-1 min-w-0 animate-pulse">
                <div className="bg-white/10 border-2 border-transparent rounded h-[336px] shrink-0"></div>
                <div className="flex flex-col gap-1">
                  <div className="h-4 bg-white/20 rounded w-3/4"></div>
                  <div className="h-4 bg-white/20 rounded w-1/4 mt-1"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-8 h-[400px]">
            {upcomingGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
        
        <div className="mt-12">
          <Pagination 
            activePage={upcomingPage} 
            totalPages={totalUpcomingPages} 
            onPageChange={setUpcomingPage} 
          />
        </div>
      </section>

      {/* ── Slider: What You Can Do ── */}
      <section className="bg-white/10 py-20 overflow-hidden relative">
        <div className="mx-auto px-12 relative" style={{ maxWidth: 1440 }}>
          <h2 className="font-roboto text-white/80 text-[40px] text-center mb-16 uppercase tracking-tighter">
            WHAT YOU CAN DO WITH SAVESLOT.
          </h2>
          
          <div className="relative group">
            <button 
              onClick={() => scroll('left')}
              className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/80 rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-8 h-8 text-black" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/80 rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-8 h-8 text-black" />
            </button>

            <div 
              ref={sliderRef}
              className="flex gap-8 overflow-x-auto no-scrollbar scroll-smooth pb-8"
            >
              {whatYouCanDoCards.map((card) => (
                <div
                  key={card.id}
                  className="w-[350px] h-[450px] shrink-0 rounded-[20px] shadow-2xl p-8 flex flex-col justify-end group/card hover:scale-[1.02] transition-transform cursor-pointer overflow-hidden relative"
                  style={{ backgroundImage: `url(${card.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  <div className="absolute inset-0 bg-black/50 group-hover/card:bg-black/60 transition-all" />
                  <h3 className="font-roboto text-3xl font-bold text-white relative z-10 drop-shadow-lg">{card.title}</h3>
                  <p className="font-roboto font-bold text-white/90 mt-4 relative z-10 drop-shadow-md">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Popular Games + Sidebar ── */}
      <section className="mx-auto px-12 py-20 flex gap-12" style={{ maxWidth: 1440 }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-8 border-b-2 border-black/10 pb-4">
            <p className="font-roboto text-2xl text-white/80 uppercase tracking-wider">
              Popular Games
            </p>
            <button 
              onClick={() => {
                useSearchStore.getState().clearFilters()
                navigate('/popular')
              }}
              className="font-roboto font-medium text-lg text-white/80 hover:text-white hover:underline transition-colors"
            >
              MORE
            </button>
          </div>

          {loadingPopular ? (
            <div className="flex flex-col gap-8">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-8 animate-pulse">
                  <div className="w-[200px] h-[280px] bg-white/10 rounded-xl shrink-0"></div>
                  <div className="flex flex-col gap-4 flex-1">
                    <div className="h-10 bg-white/20 rounded w-2/3"></div>
                    <div className="space-y-2">
                      <div className="h-5 bg-white/10 rounded w-full"></div>
                      <div className="h-5 bg-white/10 rounded w-full"></div>
                      <div className="h-5 bg-white/10 rounded w-5/6"></div>
                    </div>
                    <div className="h-10 bg-white/20 rounded-full w-32 mt-2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {popularGames.map((game, i) => (
                <Link to={`/game/${game.id}`} key={i} className="flex items-center gap-8 group cursor-pointer transition-transform duration-300 hover:scale-[1.02] origin-left">
                  <div className="w-[200px] h-[280px] bg-[#eee] border-2 border-black/80 rounded-xl overflow-hidden shrink-0 group-hover:border-white transition-all shadow-lg">
                    <img src={game.img} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex flex-col gap-4 flex-1">
                    <p className="font-roboto text-4xl text-white/80 group-hover:text-white transition-colors">
                      {game.title}
                    </p>
                    <p className="font-roboto text-lg text-white/60 leading-relaxed line-clamp-3">
                      {game.desc || 'Join millions of players in exploring this top-rated title. Check out reviews, gameplay videos, and more to see why it\'s trending this week.'}
                    </p>
                    <button className="w-fit px-6 py-2 border-2 border-white/80 text-white rounded-full font-roboto font-bold hover:bg-white hover:text-black transition-all">
                      View Details
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Sidebar />
      </section>

      <Footer />
    </div>
  )
}
