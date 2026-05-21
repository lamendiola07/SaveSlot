import { useState, useEffect, useCallback } from 'react'
import { Game } from '../types/game'
import { fetchRawgGames } from '../services/rawgApi'

interface UseGamesProps {
  query?: string
  page?: number
  pageSize?: number
  ordering?: string
  dates?: string
}

export function useGames({ query, page = 1, pageSize = 8, ordering, dates }: UseGamesProps = {}) {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const loadGames = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        page_size: pageSize.toString(),
      }
      if (query) params.search = query
      if (ordering) params.ordering = ordering
      if (dates) params.dates = dates

      const { games: fetchedGames, count } = await fetchRawgGames(params)
      setGames(fetchedGames)
      setTotalCount(count)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching games')
    } finally {
      setLoading(false)
    }
  }, [query, page, pageSize, ordering, dates])

  useEffect(() => {
    loadGames()
  }, [loadGames])

  return { games, loading, error, totalCount, refetch: loadGames }
}
