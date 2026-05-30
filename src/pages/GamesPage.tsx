import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { useSearchStore } from '../store'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useGames } from '../hooks/useGames'
import { LoadingScreen } from '../components/LoadingScreen'
import { motion, AnimatePresence } from 'framer-motion'

import { GameCard } from '../components/GameCard'

const GAMES_PER_PAGE = 8

export function GamesPage({ forceType }: { forceType?: 'upcoming' | 'popular' }) {
  const { query, ordering: storeOrdering, dates: storeDates, genres: storeGenres, metacritic: storeMetacritic, platforms: storePlatforms } = useSearchStore()
  const [currentPage, setCurrentPage] = useState(1)
  const navigate = useNavigate()

  // Use forced filters if on a specific route, otherwise use store values
  const ordering = forceType === 'upcoming' ? '-released' : forceType === 'popular' ? '-metacritic' : storeOrdering
  const dates = forceType === 'upcoming' ? '2024-01-01,2026-12-31' : forceType === 'popular' ? undefined : storeDates
  const genres = forceType ? undefined : storeGenres
  const metacritic = forceType ? undefined : storeMetacritic
  const platforms = forceType ? undefined : storePlatforms
  
  const { games, loading, error, totalCount } = useGames({ 
    query, 
    page: currentPage, 
    pageSize: GAMES_PER_PAGE,
    ordering,
    dates,
    genres,
    metacritic,
    platforms
  })

  const totalPages = Math.ceil(totalCount / GAMES_PER_PAGE)

  const goToPage = (page: number) => {
    if (page >= 1 && (totalPages === 0 || page <= totalPages)) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  let title = "BROWSE GAMES"
  if (forceType === 'upcoming' || (ordering === '-released' && dates)) title = "UPCOMING GAMES"
  else if (forceType === 'popular' || (ordering === '-metacritic')) title = "POPULAR GAMES"

  return (
    <div className="min-h-screen">
      <AnimatePresence>
        {loading && games.length === 0 && (
          <motion.div
            key="games-loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[1000]"
          >
            <LoadingScreen />
          </motion.div>
        )}
      </AnimatePresence>

      <Header />
      <main className="max-w-[1440px] mx-auto px-12 py-16">
        <div className="flex justify-between items-center mb-12">
          <h1 className="font-roboto text-5xl text-white">{title}</h1>
          <p className="text-white font-roboto">
            {loading ? 'Fetching games...' : `Showing ${totalCount} results`}
          </p>
        </div>

        {error && (
          <div className="text-center py-20 bg-red-500/10 border border-red-500/20 rounded-3xl">
            <p className="text-red-500 font-roboto text-xl">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-4 gap-8">
            {Array.from({ length: GAMES_PER_PAGE }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white/10 rounded-2xl aspect-[3/4] mb-4"></div>
                <div className="h-6 bg-white/20 rounded w-3/4 mb-2"></div>
                <div className="flex gap-2 mb-2">
                  <div className="h-4 bg-white/10 rounded-full w-12"></div>
                  <div className="h-4 bg-white/10 rounded-full w-16"></div>
                </div>
                <div className="h-5 bg-white/20 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : games.length > 0 ? (
          <>
            <div className="grid grid-cols-4 gap-8">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
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
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 2 + i
                    if (pageNum + (4 - i) > totalPages) pageNum = totalPages - (4 - i)
                  }
                  if (pageNum < 1) pageNum = i + 1
                  if (pageNum > totalPages) return null
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-roboto text-lg transition-all ${
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
            <p className="font-roboto text-3xl text-white/40">No games found{query ? ` for "${query}"` : ''}</p>
            <button 
              onClick={() => {
                useSearchStore.getState().clearFilters()
                navigate('/games')
              }}
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

