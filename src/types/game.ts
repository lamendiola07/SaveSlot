export interface Game {
  id: number
  title: string
  price: string
  img: string
  tags: string[]
  desc?: string
  rating?: number
  released?: string
}

export interface RawgGame {
  id: number
  name: string
  background_image: string
  genres: { name: string }[]
  description_raw?: string
  metacritic?: number
  released?: string
}

export interface RawgResponse {
  results: RawgGame[]
  count: number
  next: string | null
  previous: string | null
}
