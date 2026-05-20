import { useState, useMemo } from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { useSearchStore } from '../store'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ALL_GAMES } from '../data/games'

const GAMES_PER_PAGE = 8

export function GamesPage() {
  const query = useSearchStore(state => state.query)
  const [currentPage, setCurrentPage] = useState(1)
  
  const filteredGames = useMemo(() => {
    return ALL_GAMES.filter(game => 
      game.title.toLowerCase().includes(query.toLowerCase()) ||
      game.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )
  }, [query])

  const totalPages = Math.ceil(filteredGames.length / GAMES_PER_PAGE)
  const paginatedGames = filteredGames.slice((currentPage - 1) * GAMES_PER_PAGE, currentPage * GAMES_PER_PAGE)

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="bg-[#9d9d9d] min-h-screen">
      <Header />
      <main className="max-w-[1440px] mx-auto px-12 py-16">
        <div className="flex justify-between items-center mb-12">
          <h1 className="font-young-serif text-5xl text-white">BROWSE GAMES</h1>
          <p className="text-white font-shantell">Showing {filteredGames.length} results</p>
        </div>

        {paginatedGames.length > 0 ? (
          <>
            <div className="grid grid-cols-4 gap-8">
              {paginatedGames.map((game) => (
                <div key={game.id} className="group cursor-pointer">
                  <div className="bg-white/10 rounded-2xl overflow-hidden aspect-[3/4] border border-white/10 group-hover:border-white transition-all shadow-xl">
                    <img src={game.img} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-young-serif text-xl text-white">{game.title}</h3>
                    <div className="flex gap-2 mt-1">
                      {game.tags.map(tag => (
                        <span key={tag} className="text-xs bg-black/20 text-white/60 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                    <p className="font-shantell text-white/80 mt-2">{game.price}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-2">
                <button 
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1
                  // Basic windowing for pagination if many pages
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 3 + i + 1
                    if (pageNum > totalPages) pageNum = totalPages - (4 - i)
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-young-serif text-lg transition-all ${
                        currentPage === pageNum 
                        ? 'bg-white text-black scale-110 shadow-lg' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                <button 
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-32 bg-white/5 rounded-3xl border border-white/10 border-dashed">
            <p className="font-young-serif text-3xl text-white/40">No games found for "{query}"</p>
            <button 
              onClick={() => useSearchStore.getState().setQuery('')}
              className="mt-6 text-white hover:underline"
            >
              Clear search filters
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
