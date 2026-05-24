import { RawgResponse, RawgGame, Game } from '../types/game'

const API_KEY = import.meta.env.VITE_RAWG_API_KEY
const BASE_URL = 'https://api.rawg.io/api'

export const mapRawgGameToGame = (rg: RawgGame): Game => ({
  id: rg.id,
  title: rg.name,
  price: 'Check Price',
  img: rg.background_image || 'https://via.placeholder.com/600x400?text=No+Image',
  tags: rg.genres?.map(g => g.name) || [],
  desc: rg.description_raw,
  rating: rg.metacritic,
  released: rg.released,
  platforms: rg.parent_platforms?.map(p => p.platform.slug) || [],
  developers: rg.developers?.map(d => d.name) || []
})

export async function fetchRawgGames(params: Record<string, string> = {}): Promise<{ games: Game[], count: number }> {
  const queryParams = new URLSearchParams({
    key: API_KEY,
    ...params
  })

  const response = await fetch(`${BASE_URL}/games?${queryParams.toString()}`)
  if (!response.ok) throw new Error('Failed to fetch games from RAWG')
  
  const data: RawgResponse = await response.json()
  return {
    games: data.results.map(mapRawgGameToGame),
    count: data.count
  }
}

export async function fetchRawgGameDetail(id: string): Promise<Game> {
  const queryParams = new URLSearchParams({
    key: API_KEY
  })

  const response = await fetch(`${BASE_URL}/games/${id}?${queryParams.toString()}`)
  if (!response.ok) throw new Error('Failed to fetch game details from RAWG')
  
  const data: RawgGame = await response.json()
  return mapRawgGameToGame(data)
}
