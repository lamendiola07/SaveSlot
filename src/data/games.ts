export interface Game {
  id: number
  title: string
  price: string
  img: string
  tags: string[]
  desc?: string
}

export const ALL_GAMES: Game[] = [
  { id: 1, title: 'Black Myth: Wukong', price: '$59.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co867s.webp', tags: ['Action', 'RPG'] },
  { id: 2, title: 'The Witcher 3: Wild Hunt', price: '$39.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp', tags: ['RPG', 'Open World'] },
  { id: 3, title: 'Red Dead Redemption 2', price: '$49.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7h.webp', tags: ['Action', 'Open World'] },
  { id: 4, title: "Assassin's Creed Valhalla", price: '$59.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m33.webp', tags: ['Action', 'RPG'] },
  { id: 5, title: 'Elden Ring', price: '$59.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4ni8.webp', tags: ['RPG', 'Souls-like'], desc: 'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.' },
  { id: 6, title: 'Cyberpunk 2077', price: '$59.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2mdf.webp', tags: ['Action', 'RPG'], desc: 'Become a cyberpunk, an urban mercenary equipped with cybernetic enhancements.' },
  { id: 7, title: 'God of War Ragnarök', price: '$69.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5v.webp', tags: ['Action', 'Adventure'] },
  { id: 8, title: "Marvel's Spider-Man 2", price: '$69.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6m9v.webp', tags: ['Action', 'Adventure'] },
  // Pokemon Games
  { id: 101, title: 'Pokémon Red', price: '$19.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21u0.webp', tags: ['RPG', 'Pokemon'] },
  { id: 102, title: 'Pokémon Blue', price: '$19.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21u1.webp', tags: ['RPG', 'Pokemon'] },
  { id: 103, title: 'Pokémon Yellow', price: '$19.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21u2.webp', tags: ['RPG', 'Pokemon'] },
  { id: 104, title: 'Pokémon Gold', price: '$19.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21ty.webp', tags: ['RPG', 'Pokemon'] },
  { id: 105, title: 'Pokémon Silver', price: '$19.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21tz.webp', tags: ['RPG', 'Pokemon'] },
  { id: 106, title: 'Pokémon Crystal', price: '$19.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21u3.webp', tags: ['RPG', 'Pokemon'] },
  { id: 107, title: 'Pokémon Ruby', price: '$29.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21u4.webp', tags: ['RPG', 'Pokemon'] },
  { id: 108, title: 'Pokémon Sapphire', price: '$29.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21u5.webp', tags: ['RPG', 'Pokemon'] },
  { id: 109, title: 'Pokémon Emerald', price: '$29.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21u6.webp', tags: ['RPG', 'Pokemon'] },
  { id: 110, title: 'Pokémon FireRed', price: '$29.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21u7.webp', tags: ['RPG', 'Pokemon'] },
  { id: 111, title: 'Pokémon LeafGreen', price: '$29.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21u8.webp', tags: ['RPG', 'Pokemon'] },
  { id: 112, title: 'Pokémon Diamond', price: '$39.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21u9.webp', tags: ['RPG', 'Pokemon'] },
  { id: 113, title: 'Pokémon Pearl', price: '$39.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21ua.webp', tags: ['RPG', 'Pokemon'] },
  { id: 114, title: 'Pokémon Platinum', price: '$39.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21ub.webp', tags: ['RPG', 'Pokemon'] },
  { id: 115, title: 'Pokémon HeartGold', price: '$39.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21uc.webp', tags: ['RPG', 'Pokemon'] },
  { id: 116, title: 'Pokémon SoulSilver', price: '$39.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21ud.webp', tags: ['RPG', 'Pokemon'] },
  { id: 117, title: 'Pokémon Black', price: '$39.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21ue.webp', tags: ['RPG', 'Pokemon'] },
  { id: 118, title: 'Pokémon White', price: '$39.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21uf.webp', tags: ['RPG', 'Pokemon'] },
  { id: 119, title: 'Pokémon Black 2', price: '$39.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21ug.webp', tags: ['RPG', 'Pokemon'] },
  { id: 120, title: 'Pokémon White 2', price: '$39.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21uh.webp', tags: ['RPG', 'Pokemon'] },
  { id: 121, title: 'Pokémon X', price: '$39.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r98.webp', tags: ['RPG', 'Pokemon'] },
  { id: 122, title: 'Pokémon Y', price: '$39.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r99.webp', tags: ['RPG', 'Pokemon'] },
  { id: 123, title: 'Pokémon Omega Ruby', price: '$39.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21ui.webp', tags: ['RPG', 'Pokemon'] },
  { id: 124, title: 'Pokémon Alpha Sapphire', price: '$39.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21uj.webp', tags: ['RPG', 'Pokemon'] },
  { id: 125, title: 'Pokémon Sun', price: '$39.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r8c.webp', tags: ['RPG', 'Pokemon'] },
  { id: 126, title: 'Pokémon Moon', price: '$39.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r8d.webp', tags: ['RPG', 'Pokemon'] },
  { id: 127, title: 'Pokémon Ultra Sun', price: '$39.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r8e.webp', tags: ['RPG', 'Pokemon'] },
  { id: 128, title: 'Pokémon Ultra Moon', price: '$39.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r8f.webp', tags: ['RPG', 'Pokemon'] },
  { id: 129, title: 'Pokémon Sword', price: '$59.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1v8f.webp', tags: ['RPG', 'Pokemon'] },
  { id: 130, title: 'Pokémon Shield', price: '$59.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1v8g.webp', tags: ['RPG', 'Pokemon'] },
  { id: 131, title: 'Pokémon Legends: Arceus', price: '$59.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4o2q.webp', tags: ['RPG', 'Pokemon'] },
  { id: 132, title: 'Pokémon Scarlet', price: '$59.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co516x.webp', tags: ['RPG', 'Pokemon'] },
  { id: 133, title: 'Pokémon Violet', price: '$59.99', img: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co516y.webp', tags: ['RPG', 'Pokemon'] },
]
