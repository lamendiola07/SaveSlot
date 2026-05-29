import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { Star, ThumbsUp, ThumbsDown, MessageSquare, User, Send } from 'lucide-react'
import { Game } from '../types/game'
import { fetchRawgGameDetail } from '../services/rawgApi'
import { useAuthStore, useGameCommentsStore, GameComment } from '../store'

function UserHeading({ name, role, pfpUrl, size = 36 }: { name: string; role: string; pfpUrl?: string | null; size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-full bg-[#773877] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden" style={{ width: size, height: size }}>
        {pfpUrl ? <img src={pfpUrl} alt="" className="w-full h-full object-cover" /> : <User className="text-white" style={{ width: size * 0.6, height: size * 0.6 }} />}
      </div>
      <div className="flex flex-col font-roboto text-[13px] whitespace-nowrap overflow-hidden">
        <span className="text-white/90 leading-4 overflow-hidden text-ellipsis font-bold">{name}</span>
        <span className="text-white/40 leading-4 overflow-hidden text-ellipsis">{role}</span>
      </div>
    </div>
  )
}

function CommentThread({ 
  comment, 
  replies, 
  user, 
  onLike, 
  onDislike, 
  onReply 
}: { 
  comment: GameComment, 
  replies: GameComment[], 
  user: any, 
  onLike: () => void, 
  onDislike: () => void, 
  onReply: (text: string) => void 
}) {
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(replyText.trim())
      setReplyText('')
      setShowReply(false)
    }
  }

  const liked = user && comment.liked_by?.includes(user.id)
  const disliked = user && comment.disliked_by?.includes(user.id)

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3 py-4 w-full lg:w-[636px]">
        <UserHeading name={comment.profiles?.username || 'Unknown User'} role="Gamer" pfpUrl={comment.profiles?.pfp_url} />
        <p className="font-roboto text-[15px] text-white/70 leading-5">{comment.content}</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ThumbsUp onClick={user ? onLike : undefined} className={`w-5 h-5 transition-colors cursor-pointer ${liked ? 'text-blue-400' : 'text-white/40 hover:text-white'}`} />
            <span className="font-roboto font-medium text-[15px] text-white/80">{comment.liked_by?.length || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThumbsDown onClick={user ? onDislike : undefined} className={`w-5 h-5 transition-colors cursor-pointer ${disliked ? 'text-red-400' : 'text-white/40 hover:text-white'}`} />
            <span className="font-roboto font-medium text-[15px] text-white/80">{comment.disliked_by?.length || 0}</span>
          </div>
          <MessageSquare onClick={() => user && setShowReply(!showReply)} className="w-5 h-5 text-white/40 hover:text-white transition-colors cursor-pointer" />
        </div>

        {showReply && user && (
          <div className="flex gap-2 mt-2">
            <input 
              type="text" 
              value={replyText} 
              onChange={e => setReplyText(e.target.value)} 
              placeholder="Write a reply..." 
              className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-white text-sm outline-none focus:border-[#773877]" 
            />
            <button onClick={handleReplySubmit} className="bg-[#773877] hover:bg-[#8f4a8f] text-white px-4 py-1.5 rounded font-bold text-sm transition-colors">Reply</button>
          </div>
        )}
      </div>

      {replies.length > 0 && (
        <div className="flex flex-col">
          {replies.map(reply => (
            <div key={reply.id} className="flex gap-4 pl-8 py-2 w-full lg:w-[636px] relative">
              <div className="absolute left-[17px] top-0 bottom-0 w-0.5 bg-white/5" />
              <div className="flex flex-col gap-3 flex-1 min-w-0">
                <UserHeading name={reply.profiles?.username || 'Unknown User'} role="Gamer" size={32} pfpUrl={reply.profiles?.pfp_url} />
                <p className="font-roboto text-[15px] text-white/50 leading-5">{reply.content}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <ThumbsUp onClick={user ? () => onLike() /* Ideally pass reply.id, but kept simple */ : undefined} className={`w-4 h-4 transition-colors cursor-pointer ${user && reply.liked_by?.includes(user.id) ? 'text-blue-400' : 'text-white/40 hover:text-white'}`} />
                    <span className="font-roboto font-medium text-[13px] text-white/80">{reply.liked_by?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsDown onClick={user ? () => onDislike() : undefined} className={`w-4 h-4 transition-colors cursor-pointer ${user && reply.disliked_by?.includes(user.id) ? 'text-red-400' : 'text-white/40 hover:text-white'}`} />
                    <span className="font-roboto font-medium text-[13px] text-white/80">{reply.disliked_by?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useGamePrice } from '../hooks/useGamePrice'

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentInput, setCommentInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { comments, fetchComments, addComment, likeComment, dislikeComment, addReply, hasMore, loading: commentsLoading } = useGameCommentsStore()
  const { pricing, loading: pricingLoading } = useGamePrice(game?.title || '', game?.platforms)

  useEffect(() => {
    async function getDetail() {
      if (!id) return
      setLoading(true)
      try {
        const data = await fetchRawgGameDetail(id)
        setGame(data)
        // Initial fetch for comments
        fetchComments(id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load game details')
      } finally {
        setLoading(false)
      }
    }
    getDetail()
  }, [id, fetchComments])

  const handlePostComment = async () => {
    if (!id || !user || !commentInput.trim() || submitting) return
    setSubmitting(true)
    await addComment(id, user.id, commentInput.trim())
    setCommentInput('')
    setSubmitting(false)
  }

  const handleLoadMore = () => {
    if (comments.length > 0) {
      fetchComments(id!, comments[comments.length - 1].created_at)
    }
  }

  const topLevelComments = comments.filter(c => !c.parent_id)

  if (loading) {
    return (
      <div className="min-w-[1440px]">
        <Header />

        <div className="relative w-full h-[600px] overflow-hidden animate-pulse bg-white/5">
          <div className="absolute inset-0 bg-gradient-to-t from-[#240025] via-transparent to-transparent" />
          
          <div className="relative max-w-[1440px] mx-auto px-12 h-full flex items-end pb-16 gap-12">
            <div className="w-[300px] aspect-[3/4] rounded-2xl overflow-hidden bg-white/10 shrink-0">
            </div>
            <div className="flex flex-col gap-6 pb-4 w-full">
              <div className="flex gap-2">
                <div className="w-16 h-6 bg-white/10 rounded-full"></div>
                <div className="w-20 h-6 bg-white/10 rounded-full"></div>
              </div>
              <div className="h-16 bg-white/20 rounded w-1/2"></div>
              <div className="flex items-center gap-8">
                <div className="h-6 bg-white/10 rounded w-32"></div>
                <div className="h-6 bg-white/10 rounded w-40"></div>
                <div className="h-8 bg-white/20 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>

        <section className="mx-auto px-12 py-16 max-w-[1440px] grid grid-cols-3 gap-16 animate-pulse">
          <div className="col-span-2">
            <div className="h-8 bg-white/20 rounded w-32 mb-8"></div>
            <div className="space-y-4">
              <div className="h-5 bg-white/10 rounded w-full"></div>
              <div className="h-5 bg-white/10 rounded w-full"></div>
              <div className="h-5 bg-white/10 rounded w-5/6"></div>
              <div className="h-5 bg-white/10 rounded w-4/6"></div>
            </div>
          </div>
          <div className="col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <div className="h-8 bg-white/20 rounded w-32 mb-6"></div>
              <div className="space-y-6">
                <div>
                  <div className="h-4 bg-white/10 rounded w-24 mb-2"></div>
                  <div className="h-5 bg-white/20 rounded w-32"></div>
                </div>
                <div>
                  <div className="h-4 bg-white/10 rounded w-24 mb-2"></div>
                  <div className="h-5 bg-white/20 rounded w-48"></div>
                </div>
                <div className="w-full h-14 bg-white/20 rounded-xl mt-8"></div>
                <div className="w-full h-14 bg-white/10 rounded-xl"></div>
              </div>
            </div>
          </div>
        </section>

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

  const displayPrice = pricing?.cheapestPrice || (pricingLoading ? '...' : 'Check Price')

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
            <div className="flex items-center gap-4">
              <h1 className="font-roboto text-6xl text-white font-bold drop-shadow-lg">{game.title}</h1>
              {pricing?.isOnSale && (
                <span className="bg-red-600 text-white px-3 py-1 rounded-lg font-bold text-xl shadow-lg animate-bounce">
                  {pricing.savings}
                </span>
              )}
            </div>
            <div className="flex items-center gap-8 text-white/80 font-roboto text-xl">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                <span>{game.rating || 'N/A'} Metacritic</span>
              </div>
              <div>Released: {game.released}</div>
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-bold ${pricing?.isOnSale ? 'text-green-400' : 'text-white'}`}>
                  {displayPrice}
                </span>
                {pricing?.isOnSale && (
                  <span className="text-white/40 line-through text-lg">
                    {pricing.normalPrice}
                  </span>
                )}
              </div>
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
            
            {/* Comment Input */}
            <div className="flex items-start gap-3 py-4 w-full mb-8">
              <div className="w-9 h-9 rounded-full bg-[#773877] border border-white/10 flex items-center justify-center shrink-0 mt-1 overflow-hidden">
                {user?.user_metadata?.pfpUrl ? <img src={user.user_metadata.pfpUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-white" />}
              </div>
              <div className="flex-1 flex flex-col gap-3">
                <textarea 
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder={user ? "Add a comment..." : "Sign in to join the conversation"}
                  disabled={!user || submitting}
                  className="w-full bg-white/5 border-2 border-white/10 rounded-xl p-4 text-white font-roboto text-[15px] outline-none focus:border-[#773877] transition-all min-h-[100px] resize-none disabled:opacity-50"
                />
                <div className="flex justify-end">
                  <button 
                    onClick={handlePostComment}
                    disabled={!user || !commentInput.trim() || submitting}
                    className="flex items-center gap-2 bg-[#773877] hover:bg-[#8f4a8f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-2 rounded-xl transition-all shadow-lg"
                  >
                    {submitting ? 'Posting...' : 'Post Comment'}
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              {topLevelComments.map((comment) => (
                <CommentThread 
                  key={comment.id} 
                  comment={comment}
                  replies={comments.filter(c => c.parent_id === comment.id)}
                  user={user}
                  onLike={() => likeComment(comment.id, user!.id)}
                  onDislike={() => dislikeComment(comment.id, user!.id)}
                  onReply={(text) => addReply(id!, comment.id, user!.id, text)}
                />
              ))}
              
              {comments.length === 0 && !commentsLoading && (
                <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
                  <p className="font-roboto text-white/20 text-lg">No comments yet. Be the first to share your thoughts!</p>
                </div>
              )}

              {commentsLoading && (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-[#773877] border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {hasMore && !commentsLoading && (
                <button 
                  onClick={handleLoadMore}
                  className="mt-8 py-3 w-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl font-roboto font-medium transition-all border border-white/5"
                >
                  Load More Comments
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sticky top-8">
            <h3 className="font-roboto text-2xl text-white mb-6">Game Info</h3>
            <div className="space-y-6">
              {pricing?.storeName && (
                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                  {pricing.storeIcon && <img src={pricing.storeIcon} alt="" className="w-8 h-8" />}
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider">Best Deal at</p>
                    <p className="text-white font-bold">{pricing.storeName}</p>
                  </div>
                </div>
              )}
              {game.developers && game.developers.length > 0 && (
                <div>
                  <p className="text-white/40 text-sm mb-1 uppercase tracking-wider">Developer</p>
                  <p className="text-white">{game.developers.join(', ')}</p>
                </div>
              )}
              <div>
                <p className="text-white/40 text-sm mb-1 uppercase tracking-wider">Platforms</p>
                <p className="text-white">PC, PS5, Xbox Series X/S</p>
              </div>
              {pricing?.dealLink ? (
                <a 
                  href={pricing.dealLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full bg-green-600 text-white text-center font-roboto font-bold py-4 rounded-xl hover:bg-green-500 transition-all mt-8"
                >
                  VIEW DEAL ON {pricing.storeName?.toUpperCase()}
                </a>
              ) : (
                <button className="w-full bg-white text-black font-roboto font-bold py-4 rounded-xl hover:bg-white/90 transition-all mt-8">
                  ADD TO WISHLIST
                </button>
              )}
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

