import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Heart, LayoutGrid, Calendar, MoreHorizontal, Pencil,
  Trash2, Gamepad2, Camera, Star, MessageCircle, Repeat2,
} from 'lucide-react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { PfpCropModal } from '../components/PfpCropModal'
import { useAuthStore, usePostsStore } from '../store'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function ratingColor(score: number) {
  if (score >= 75) return 'bg-green-500/20 text-green-400 border-green-500/30'
  if (score >= 50) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  return 'bg-red-500/20 text-red-400 border-red-500/30'
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function UserProfilePage() {
  const { user, isAuthenticated } = useAuthStore()
  const { posts, likePost, editPost, deletePost, addComment, repostPost } = usePostsStore()
  const navigate = useNavigate()

  // Profile state
  const [pfpUrl, setPfpUrl] = useState<string | null>(() =>
    user?.id ? localStorage.getItem(`pfp_${user.id}`) : null
  )
  const [coverUrl, setCoverUrl] = useState<string | null>(() =>
    user?.id ? localStorage.getItem(`cover_${user.id}`) : null
  )
  const [showCropModal, setShowCropModal] = useState(false)

  // Post interaction state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null)
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({})

  const coverInputRef = useRef<HTMLInputElement>(null)

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : ''

  const userPosts = posts.filter(p => p.userId === user?.id)
  const totalLikes = userPosts.reduce((acc, p) => acc + p.likes, 0)

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth')
  }, [isAuthenticated, navigate])

  const handlePfpSave = (url: string) => {
    setPfpUrl(url)
    if (user?.id) localStorage.setItem(`pfp_${user.id}`, url)
  }

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    const url = await readAsDataURL(file)
    setCoverUrl(url)
    localStorage.setItem(`cover_${user.id}`, url)
  }

  const startEdit = (postId: string, current: string) => {
    setEditingId(postId); setEditContent(current); setOpenMenuId(null)
  }
  const saveEdit = () => {
    if (editingId) editPost(editingId, editContent)
    setEditingId(null); setEditContent('')
  }
  const cancelEdit = () => { setEditingId(null); setEditContent('') }
  const handleDelete = (postId: string) => { deletePost(postId); setOpenMenuId(null) }

  const submitComment = (postId: string) => {
    const text = commentTexts[postId]?.trim()
    if (!text || !user) return
    addComment(postId, { userId: user.id, username, pfpUrl, content: text })
    setCommentTexts(prev => ({ ...prev, [postId]: '' }))
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#803da4] to-[#240025] flex flex-col">
      <Header />

      <main className="flex-1">
        {/* ── Cover photo ── */}
        <div className="relative w-full h-52 overflow-hidden group">
          {coverUrl
            ? <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
            : (
              <div className="w-full h-full bg-gradient-to-r from-[#773877] via-[#5a2160] to-[#240025]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(199,127,199,0.15),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(119,56,119,0.2),transparent_60%)]" />
              </div>
            )
          }
          <button
            onClick={() => coverInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2">
              <Camera className="w-4 h-4 text-white" />
              <span className="font-roboto text-white text-sm font-medium">Edit Cover Photo</span>
            </span>
          </button>
          <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
        </div>

        <div className="max-w-4xl mx-auto px-4">
          {/* ── Profile info ── */}
          <div className="flex items-center gap-5 py-5 border-b border-white/10">
            {/* PFP with edit overlay */}
            <div className="relative group/pfp shrink-0">
              <div className="w-24 h-24 rounded-full bg-[#773877] border-4 border-[#240025] flex items-center justify-center overflow-hidden shadow-xl">
                {pfpUrl
                  ? <img src={pfpUrl} alt="Profile" className="w-full h-full object-cover" />
                  : <User className="w-10 h-10 text-white" />
                }
              </div>
              <button
                onClick={() => setShowCropModal(true)}
                className="absolute inset-0 rounded-full bg-black/55 flex items-center justify-center opacity-0 group-hover/pfp:opacity-100 transition-opacity"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
            </div>
            <div>
              <h1 className="font-roboto font-bold text-white text-2xl leading-tight">{username}</h1>
              <p className="font-roboto text-white/40 text-sm">{user.email}</p>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="flex items-center gap-8 py-4 border-b border-white/10 mb-8">
            <div>
              <p className="font-roboto font-bold text-white text-xl leading-none">{userPosts.length}</p>
              <p className="font-roboto text-white/40 text-xs mt-1">Posts</p>
            </div>
            <div>
              <p className="font-roboto font-bold text-white text-xl leading-none">{totalLikes}</p>
              <p className="font-roboto text-white/40 text-xs mt-1">Likes received</p>
            </div>
            {joinedDate && (
              <div className="flex items-center gap-1.5 ml-auto">
                <Calendar className="w-3.5 h-3.5 text-white/30" />
                <p className="font-roboto text-white/30 text-xs">Joined {joinedDate}</p>
              </div>
            )}
          </div>

          {/* ── Posts ── */}
          <div className="pb-16">
            <h2 className="font-roboto font-semibold text-white/50 text-xs uppercase tracking-widest mb-5">
              Posts · {userPosts.length}
            </h2>

            {userPosts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-24">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <LayoutGrid className="w-7 h-7 text-white/15" />
                </div>
                <p className="font-roboto text-white/30 text-sm">No posts yet</p>
                <p className="font-roboto text-white/20 text-xs">Share something with the community!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {userPosts.map(post => {
                  const liked = post.likedBy.includes(user.id)
                  const reposted = post.repostedBy.includes(user.id)
                  const isEditing = editingId === post.id
                  const isMenuOpen = openMenuId === post.id
                  const commentsOpen = openCommentsId === post.id

                  const leftPhoto = post.taggedGame?.cover
                    ?? post.gifUrl
                    ?? (post.mediaType === 'image' ? post.mediaUrl : undefined)

                  return (
                    <article key={post.id} className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden flex">

                      {/* ── Left photo 300×500 ── */}
                      <div className="w-[300px] shrink-0 self-stretch" style={{ minHeight: 500 }}>
                        {leftPhoto ? (
                          <img src={leftPhoto} alt="cover" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-b from-[#773877]/30 to-[#240025] flex items-center justify-center">
                            <Gamepad2 className="w-14 h-14 text-white/10" />
                          </div>
                        )}
                      </div>

                      {/* ── Right column ── */}
                      <div className="flex-1 flex flex-col min-w-0 p-5">

                        {/* User row + ellipsis */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-[#773877] border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
                              {post.pfpUrl
                                ? <img src={post.pfpUrl} alt="" className="w-full h-full object-cover" />
                                : <User className="w-4 h-4 text-white" />
                              }
                            </div>
                            <div>
                              <p className="font-roboto font-bold text-white text-sm leading-tight">{post.username}</p>
                              <p className="font-roboto text-white/35 text-xs mt-0.5">{timeAgo(post.createdAt)}</p>
                            </div>
                          </div>

                          {/* Ellipsis */}
                          <div className="relative shrink-0">
                            <button
                              onClick={() => setOpenMenuId(isMenuOpen ? null : post.id)}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {isMenuOpen && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                <div className="absolute right-0 top-full mt-1 w-36 bg-[#2a0838] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20">
                                  <button onClick={() => startEdit(post.id, post.content)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 transition-colors text-sm font-roboto">
                                    <Pencil className="w-3.5 h-3.5 text-[#c77fc7]" />Edit
                                  </button>
                                  <button onClick={() => handleDelete(post.id)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-white/70 hover:text-red-400 hover:bg-white/5 transition-colors text-sm font-roboto">
                                    <Trash2 className="w-3.5 h-3.5 text-red-400/70" />Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Star rating */}
                        {post.starRating != null && post.starRating > 0 && (
                          <div className="flex items-center gap-0.5 mb-3 pl-[2.875rem]">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= post.starRating! ? 'fill-yellow-400 text-yellow-400' : 'text-white/15'}`} />
                            ))}
                            <span className="font-roboto text-white/35 text-xs ml-1">{post.starRating}/5</span>
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1">
                          {isEditing ? (
                            <textarea
                              autoFocus value={editContent} onChange={e => setEditContent(e.target.value)} rows={5}
                              className="w-full bg-white/5 border border-white/20 focus:border-[#773877] rounded-xl px-3 py-2.5 text-white text-sm font-roboto resize-none outline-none transition-colors"
                            />
                          ) : (
                            post.content && (
                              <p className="font-roboto text-white/90 text-sm leading-relaxed">{post.content}</p>
                            )
                          )}

                          {/* Tagged users */}
                          {post.taggedUsers.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {post.taggedUsers.map(tag => (
                                <span key={tag} className="font-roboto text-[#c77fc7] text-xs bg-[#773877]/20 px-2 py-0.5 rounded-full">@{tag}</span>
                              ))}
                            </div>
                          )}

                          {/* Video (right side only when no left photo) */}
                          {post.mediaUrl && post.mediaType === 'video' && !post.taggedGame && !post.gifUrl && (
                            <div className="mt-3">
                              <video src={post.mediaUrl} controls className="w-full rounded-xl max-h-48" />
                            </div>
                          )}
                        </div>

                        {/* ── Game metadata (bigger text) ── */}
                        {post.taggedGame && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                              <Gamepad2 className="w-4 h-4 text-orange-400 shrink-0" />
                              <p className="font-roboto font-bold text-white text-lg leading-tight truncate">
                                {post.taggedGame.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              {post.taggedGame.rating != null && (
                                <span className={`font-roboto font-bold text-sm px-2.5 py-1 rounded-lg border ${ratingColor(post.taggedGame.rating)}`}>
                                  Metacritic {post.taggedGame.rating}
                                </span>
                              )}
                              {post.taggedGame.genres && post.taggedGame.genres.length > 0 && (
                                <span className="font-roboto text-white/50 text-sm">{post.taggedGame.genres.join(' · ')}</span>
                              )}
                              {post.taggedGame.released && (
                                <span className="font-roboto text-white/35 text-sm">
                                  {new Date(post.taggedGame.released).getFullYear()}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* ── Actions ── */}
                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-5">
                          {isEditing ? (
                            <>
                              <button onClick={saveEdit} className="bg-[#773877] hover:bg-[#8f4a8f] text-white text-xs font-roboto font-medium px-4 py-1.5 rounded-lg transition-colors">Save</button>
                              <button onClick={cancelEdit} className="bg-white/10 hover:bg-white/20 text-white/70 text-xs font-roboto px-4 py-1.5 rounded-lg transition-colors">Cancel</button>
                            </>
                          ) : (
                            <>
                              {/* Like */}
                              <button onClick={() => likePost(post.id, user.id)} className={`flex items-center gap-1.5 text-xs font-roboto transition-colors ${liked ? 'text-red-400' : 'text-white/35 hover:text-red-400'}`}>
                                <Heart className={`w-4 h-4 transition-all ${liked ? 'fill-red-400 scale-110' : ''}`} />
                                {post.likes > 0 && <span>{post.likes}</span>}
                              </button>

                              {/* Comment */}
                              <button
                                onClick={() => setOpenCommentsId(commentsOpen ? null : post.id)}
                                className={`flex items-center gap-1.5 text-xs font-roboto transition-colors ${commentsOpen ? 'text-[#c77fc7]' : 'text-white/35 hover:text-[#c77fc7]'}`}
                              >
                                <MessageCircle className="w-4 h-4" />
                                {post.comments.length > 0 && <span>{post.comments.length}</span>}
                              </button>

                              {/* Repost */}
                              <button onClick={() => repostPost(post.id, user.id)} className={`flex items-center gap-1.5 text-xs font-roboto transition-colors ${reposted ? 'text-green-400' : 'text-white/35 hover:text-green-400'}`}>
                                <Repeat2 className="w-4 h-4" />
                                {post.reposts > 0 && <span>{post.reposts}</span>}
                              </button>
                            </>
                          )}
                        </div>

                        {/* ── Comments section ── */}
                        {commentsOpen && !isEditing && (
                          <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-2.5">
                            {/* Existing comments */}
                            {post.comments.map(c => (
                              <div key={c.id} className="flex gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-[#773877] border border-white/20 flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
                                  {c.pfpUrl ? <img src={c.pfpUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-3 h-3 text-white" />}
                                </div>
                                <div className="flex-1 bg-white/5 rounded-xl px-3 py-2">
                                  <div className="flex items-baseline gap-2">
                                    <p className="font-roboto font-semibold text-white text-xs">{c.username}</p>
                                    <p className="font-roboto text-white/30 text-[10px]">{timeAgo(c.createdAt)}</p>
                                  </div>
                                  <p className="font-roboto text-white/75 text-xs mt-0.5 leading-relaxed">{c.content}</p>
                                </div>
                              </div>
                            ))}

                            {/* New comment input */}
                            <div className="flex gap-2.5 items-center">
                              <div className="w-7 h-7 rounded-full bg-[#773877] border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
                                {pfpUrl ? <img src={pfpUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-3 h-3 text-white" />}
                              </div>
                              <input
                                type="text"
                                placeholder="Write a comment…"
                                value={commentTexts[post.id] || ''}
                                onChange={e => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                                onKeyDown={e => { if (e.key === 'Enter') submitComment(post.id) }}
                                className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-1.5 text-white text-xs font-roboto placeholder:text-white/30 outline-none focus:border-[#773877] transition-colors"
                              />
                            </div>
                          </div>
                        )}

                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {showCropModal && (
        <PfpCropModal onClose={() => setShowCropModal(false)} onSave={handlePfpSave} />
      )}
    </div>
  )
}
