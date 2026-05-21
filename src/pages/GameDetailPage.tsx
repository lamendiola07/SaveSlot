import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { ChevronRight, Loader2, Star } from 'lucide-react'
import { Game } from '../types/game'
import { fetchRawgGameDetail } from '../services/rawgApi'

const imgProfile = 'https://www.figma.com/api/mcp/asset/87533ed7-1e60-4488-9557-f7f13e2939da'
const imgThumbsUp = 'https://www.figma.com/api/mcp/asset/3dc156e7-5edc-49ac-95a4-da890bda6400'
const imgThumbsDown = 'https://www.figma.com/api/mcp/asset/32f04a81-fa7c-42d9-8954-a823d904cd0a'
const imgMessageComment = 'https://www.figma.com/api/mcp/asset/ecb81871-cd25-4f96-befa-a53eda5c09d4'
const imgLine = 'https://www.figma.com/api/mcp/asset/bed8d55a-88f0-4f90-b40e-91682dd90e42'

interface Reply {
  name: string
  role: string
  text: string
  likes: number
  dislikes: number
}

interface Comment {
  name: string
  role: string
  text: string
  likes: number
  dislikes: number
  replies: Reply[]
}

const comments: Comment[] = [
  {
    name: 'Lysandra Bellamy',
    role: 'Gamer and Streamer',
    text: 'This game is amazing! The graphics are top-notch.',
    likes: 24,
    dislikes: 2,
    replies: [
      { name: 'Kaius Orlov', role: 'Game Developer', text: 'I agree! The storyline is really engaging.', likes: 12, dislikes: 0 },
      { name: 'Seraphina Voss', role: 'Game Enthusiast', text: "Can't wait for the next update!", likes: 8, dislikes: 1 },
      { name: 'Thorne Adler', role: 'Competitive Gamer', text: 'The multiplayer mode is so much fun!', likes: 5, dislikes: 0 },
    ],
  },
]

function Reactions({ likes, dislikes }: { likes: number; dislikes: number }) {
  return (
    <div className="flex items-center">
      <div className="flex items-center gap-2 w-[72px]">
        <img src={imgThumbsUp} alt="like" className="w-6 h-6" />
        <span className="font-roboto font-medium text-[15px] text-white/80">{likes}</span>
      </div>
      <div className="flex items-center gap-2 w-[72px]">
        <img src={imgThumbsDown} alt="dislike" className="w-6 h-6" />
        <span className="font-roboto font-medium text-[15px] text-white/80">{dislikes}</span>
      </div>
      <img src={imgMessageComment} alt="reply" className="w-6 h-6" />
    </div>
  )
}

function UserHeading({ name, role, size = 36 }: { name: string; role: string; size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <img src={imgProfile} alt={name} className="shrink-0" style={{ width: size, height: size }} />
      <div className="flex flex-col font-roboto text-[13px] whitespace-nowrap overflow-hidden">
        <span className="text-white/90 leading-4 overflow-hidden text-ellipsis">{name}</span>
        <span className="text-white/40 leading-4 overflow-hidden text-ellipsis">{role}</span>
      </div>
    </div>
  )
}

function CommentThread({ comment }: { comment: Comment }) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3 py-4 w-full lg:w-[636px]">
        <UserHeading name={comment.name} role={comment.role} />
        <p className="font-roboto text-[15px] text-white/50 leading-5">{comment.text}</p>
        <Reactions likes={comment.likes} dislikes={comment.dislikes} />
      </div>

      <div className="flex flex-col">
        {comment.replies.map((reply, i) => (
          <div key={i} className="flex gap-4 pl-8 py-2 w-full lg:w-[636px]">
            <div className="relative self-stretch w-0 shrink-0">
              <div className="absolute inset-y-0 -inset-x-px">
                <img src={imgLine} alt="" className="w-full h-full" />
              </div>
            </div>
            <div className="flex flex-col gap-3 flex-1 min-w-0">
              <UserHeading name={reply.name} role={reply.role} size={36} />
              <p className="font-roboto text-[15px] text-white/50 leading-5">{reply.text}</p>
              <Reactions likes={reply.likes} dislikes={reply.dislikes} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getDetail() {
      if (!id) return
      setLoading(true)
      try {
        const data = await fetchRawgGameDetail(id)
        setGame(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load game details')
      } finally {
        setLoading(false)
      }
    }
    getDetail()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center text-white/40">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="font-roboto text-2xl">Fetching game details...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center text-red-500">
          <p className="font-roboto text-2xl mb-4">{error || 'Game not found'}</p>
          <button onClick={() => window.history.back()} className="text-white hover:underline">Go Back</button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-w-[1440px]">
      <Header />

      <div className="relative w-full h-[600px] overflow-hidden">
        <img src={game.img} alt={game.title} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#240025] via-transparent to-transparent" />
        
        <div className="relative max-w-[1440px] mx-auto px-12 h-full flex items-end pb-16 gap-12">
          <div className="w-[300px] aspect-[3/4] rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl shrink-0">
            <img src={game.img} alt={game.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col gap-6 pb-4">
            <div className="flex flex-wrap gap-2">
              {game.tags.map(tag => (
                <span key={tag} className="bg-white/10 text-white px-3 py-1 rounded-full text-sm backdrop-blur-md">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="font-roboto text-6xl text-white font-bold drop-shadow-lg">{game.title}</h1>
            <div className="flex items-center gap-8 text-white/80 font-roboto text-xl">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                <span>{game.rating || 'N/A'} Metacritic</span>
              </div>
              <div>Released: {game.released}</div>
              <div className="text-2xl font-bold text-white">{game.price}</div>
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto px-12 py-16 max-w-[1440px] grid grid-cols-3 gap-16">
        <div className="col-span-2">
          <h2 className="font-roboto text-3xl text-white mb-8 border-b border-white/10 pb-4">About</h2>
          <div 
            className="font-roboto text-white/70 text-lg leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: game.desc || 'No description available for this game.' }}
          />
          
          <div className="mt-20">
            <h2 className="font-roboto text-3xl text-white mb-8 border-b border-white/10 pb-4">Comments</h2>
            <div className="flex items-start gap-3 py-4 w-full">
              <img src={imgProfile} alt="Your avatar" className="w-9 h-9 shrink-0 mt-1" />
              <div className="flex-1 border-2 border-white/20 rounded min-h-[76px] px-3 py-2">
                <p className="font-roboto text-[15px] text-white/30 leading-5">Add a comment...</p>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              {comments.map((comment, i) => (
                <CommentThread key={i} comment={comment} />
              ))}
            </div>
            <div className="flex items-center justify-start mt-12 gap-2">
              {[1, 2, 3].map((n) => (
                <button key={n} className={`w-10 h-10 rounded-lg flex items-center justify-center font-roboto ${n === 1 ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
                  {n}
                </button>
              ))}
              <button className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sticky top-8">
            <h3 className="font-roboto text-2xl text-white mb-6">Game Info</h3>
            <div className="space-y-6">
              <div>
                <p className="text-white/40 text-sm mb-1 uppercase tracking-wider">Developer</p>
                <p className="text-white">To be fetched...</p>
              </div>
              <div>
                <p className="text-white/40 text-sm mb-1 uppercase tracking-wider">Platforms</p>
                <p className="text-white">PC, PS5, Xbox Series X/S</p>
              </div>
              <button className="w-full bg-white text-black font-roboto font-bold py-4 rounded-xl hover:bg-white/90 transition-all mt-8">
                ADD TO WISHLIST
              </button>
              <button className="w-full bg-[#773877] text-white font-roboto font-bold py-4 rounded-xl hover:bg-[#8e448e] transition-all">
                I'VE PLAYED THIS
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

