import { useState, useEffect, useRef } from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { Sidebar } from '../components/Sidebar'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { ALL_GAMES } from '../data/games'

const BACKGROUNDS = [
  'https://www.figma.com/api/mcp/asset/b43ca7e4-f677-4796-8378-ee5d25b13689', // Minecraft
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop', // Gaming setup
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop', // Abstract gaming
]

const UPCOMING_DATA = ALL_GAMES.slice(0, 8)
const POPULAR_GAMES = ALL_GAMES.filter(g => [5, 6].includes(g.id))

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
  { id: 1, title: 'Track Progress', description: 'Keep tabs on your gaming journey.', color: 'bg-blue-400' },
  { id: 2, title: 'Connect Friends', description: 'Share your high scores and achievements.', color: 'bg-green-400' },
  { id: 3, title: 'Discover Games', description: 'Find your next obsession easily.', color: 'bg-purple-400' },
  { id: 4, title: 'Personal Lists', description: 'Curate the perfect wishlist.', color: 'bg-red-400' },
  { id: 5, title: 'Game Reviews', description: 'Read and write community reviews.', color: 'bg-yellow-400' },
  { id: 6, title: 'Live Events', description: 'Join exclusive community tournaments.', color: 'bg-orange-400' },
]

function GameCard({ title, price, img }: { title: string; price: string; img: string }) {
  return (
    <div className="flex flex-col gap-3 flex-1 min-w-0 group cursor-pointer">
      <div className="bg-[#eee] border-2 border-black/80 rounded overflow-hidden h-[336px] flex items-center justify-center shrink-0 group-hover:border-white transition-all">
        <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
      </div>
      <div className="font-roboto font-medium text-[15px] text-white/80 flex flex-col">
        <span className="overflow-hidden text-ellipsis whitespace-nowrap group-hover:text-white/80">{title}</span>
        <span>{price}</span>
      </div>
    </div>
  )
}

export function StartupPage() {
  const [bgIndex, setBgIndex] = useState(0)
  const [upcomingPage, setUpcomingPage] = useState(1)
  const sliderRef = useRef<HTMLDivElement>(null)

  const itemsPerPage = 4
  const totalUpcomingPages = Math.ceil(UPCOMING_DATA.length / itemsPerPage)
  const currentUpcoming = UPCOMING_DATA.slice((upcomingPage - 1) * itemsPerPage, upcomingPage * itemsPerPage)

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
          <button className="flex items-center gap-1 font-roboto font-medium text-lg text-white/80 hover:text-white hover:underline transition-colors">
            See all
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-8 h-[400px]">
          {currentUpcoming.map((game) => (
            <GameCard key={game.id} title={game.title} price={game.price} img={game.img} />
          ))}
        </div>
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
            {/* Navigation Arrows */}
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
                  className="w-[350px] h-[450px] shrink-0 bg-[#d9d9d9] rounded-[20px] shadow-2xl p-8 flex flex-col justify-end group/card hover:scale-[1.02] transition-transform cursor-pointer overflow-hidden relative"
                >
                  <div className={`absolute inset-0 ${card.color} opacity-20 group-hover/card:opacity-40 transition-opacity`} />
                  <h3 className="font-roboto text-3xl text-black/80 relative z-10">{card.title}</h3>
                  <p className="font-roboto text-black/60 mt-4 relative z-10">{card.description}</p>
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
            <button className="font-roboto font-medium text-lg text-white/80 hover:text-white hover:underline transition-colors">MORE</button>
          </div>

          <div className="flex flex-col gap-8">
            {POPULAR_GAMES.map((game, i) => (
              <div key={i} className="flex items-center gap-8 group cursor-pointer">
                <div className="w-[200px] h-[280px] bg-[#eee] border-2 border-black/80 rounded-xl overflow-hidden shrink-0 group-hover:border-white transition-all shadow-lg">
                  <img src={game.img} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex flex-col gap-4 flex-1">
                  <p className="font-roboto text-4xl text-white/80 group-hover:text-white transition-colors">
                    {game.title}
                  </p>
                  <p className="font-roboto text-lg text-white/60 leading-relaxed">
                    {game.desc}
                  </p>
                  <button className="w-fit px-6 py-2 border-2 border-white/80 text-white rounded-full font-roboto font-bold hover:bg-white hover:text-black transition-all">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Sidebar />
      </section>

      <Footer />
    </div>
  )
}
