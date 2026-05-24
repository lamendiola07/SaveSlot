export interface Game {
  id: number
  title: string
  price: string
  img: string
  tags: string[]
  desc?: string
  rating?: number
  released?: string
  // Real-time pricing fields
  cheapestPrice?: string
  normalPrice?: string
  isOnSale?: boolean
  savings?: string
  dealLink?: string
  storeName?: string
  storeIcon?: string
  // Platform info
  platforms?: string[]
  // Company info
  developers?: string[]
}

export interface RawgGame {
  id: number
  name: string
  background_image: string
  genres: { name: string }[]
  description_raw?: string
  metacritic?: number
  released?: string
  parent_platforms?: { platform: { id: number; name: string; slug: string } }[]
  developers?: { name: string }[]
}

export interface RawgResponse {
  results: RawgGame[]
  count: number
  next: string | null
  previous: string | null
}
