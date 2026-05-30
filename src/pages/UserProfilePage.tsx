import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  User, Heart, LayoutGrid, Calendar, MoreHorizontal, Pencil,
  Trash2, Gamepad2, Camera, Star, MessageCircle, Repeat2, CheckCircle2
} from 'lucide-react'

import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { PfpCropModal } from '../components/PfpCropModal'
import { CoverCropModal } from '../components/CoverCropModal'
import { useAuthStore, usePostsStore, usePlayedGamesStore } from '../store'
import { supabase } from '../services/supabase'

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


export function UserProfilePage() {
  const { user: currentUser, isAuthenticated } = useAuthStore()
  const { userId } = useParams<{ userId?: string }>()
  const { posts, likePost, editPost, deletePost, addComment, repostPost } = usePostsStore()
  const { playedGames, fetchPlayedGames, loading: gamesLoading } = usePlayedGamesStore()
  const navigate = useNavigate()

  // UI state
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showCropModal, setShowCropModal] = useState(false)
  const [showCoverModal, setShowCoverModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'games'>('posts')

  // Post interaction state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null)
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({})


  const isOwnProfile = !userId || userId === currentUser?.id
  const targetUserId = userId || currentUser?.id

  useEffect(() => {
    if (!isAuthenticated && !userId) {
      navigate('/auth')
      return
    }

    async function fetchProfile() {
      if (!targetUserId) return
      setLoading(true)
      
      // Parallel fetch profile and games
      const [profileRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', targetUserId).single(),
        fetchPlayedGames(targetUserId)
      ])

      const { data, error } = profileRes

      if (error) {
        console.error('Error fetching profile:', error)
      } else {
        const localCover = localStorage.getItem(`cover_${targetUserId}`)
        setProfile({ ...data, cover_url: localCover || data.cover_url || null })
      }
      setLoading(false)
    }

    fetchProfile()
  }, [targetUserId, isAuthenticated, userId, navigate, fetchPlayedGames])

  const handlePfpSave = async (dataUrl: string) => {
    if (!currentUser) return
    localStorage.setItem(`pfp_${currentUser.id}`, dataUrl)
    setProfile({ ...profile, pfp_url: dataUrl })
    await supabase.from('profiles').update({ pfp_url: dataUrl }).eq('id', currentUser.id)
  }

  const handleCoverSave = async (dataUrl: string): Promise<void> => {
    if (!currentUser) return
    localStorage.setItem(`cover_${currentUser.id}`, dataUrl)
    setProfile({ ...profile, cover_url: dataUrl })
    // Best-effort Supabase persist (silent if column doesn't exist yet)
    supabase.from('profiles').update({ cover_url: dataUrl }).eq('id', currentUser.id)
  }

  // Filter posts for the profile being viewed
  const userPosts = posts.filter(p => p.userId === targetUserId)
  const totalLikes = userPosts.reduce((acc, p) => acc + p.likes, 0)

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
    if (!text || !currentUser) return
    addComment(postId, { 
      userId: currentUser.id, 
      username: currentUser.user_metadata?.username || currentUser.email?.split('@')[0], 
      pfpUrl: profile?.pfp_url, 
      content: text 
    })
    setCommentTexts(prev => ({ ...prev, [postId]: '' }))
  }

  if (loading) return (
    <div className="min-h-screen bg-[#240025] flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#773877] border-t-transparent rounded-full animate-spin" />
      </div>
      <Footer />
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen bg-[#240025] flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center text-white/40">
        User not found
      </div>
      <Footer />
    </div>
  )

  const username = profile.username || 'User'
  const joinedDate = profile.updated_at
    ? new Date(profile.updated_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : ''

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#803da4] to-[#240025] flex flex-col">
      <Header />

      <main className="flex-1">
        {/* ── Cover photo ── */}
        <div className="relative w-full h-52 overflow-hidden group">
          {profile.cover_url
            ? <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
            : (
              <div className="w-full h-full bg-gradient-to-r from-[#773877] via-[#5a2160] to-[#240025]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(199,127,199,0.15),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(119,56,119,0.2),transparent_60%)]" />
              </div>
            )
          }
          {isOwnProfile && (
            <button
              onClick={() => setShowCoverModal(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors"
            >
              <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2">
                <Camera className="w-4 h-4 text-white" />
                <span className="font-roboto text-white text-sm font-medium">Edit Cover Photo</span>
              </span>
            </button>
          )}
        </div>

        <div className="max-w-4xl mx-auto px-4">
          {/* ── Profile info ── */}
          <div className="flex items-center gap-5 py-5 border-b border-white/10">
            {/* PFP with edit overlay */}
            <div className="relative group/pfp shrink-0">
              <div className="w-24 h-24 rounded-full bg-[#773877] border-4 border-[#240025] flex items-center justify-center overflow-hidden shadow-xl">
                {profile.pfp_url
                  ? <img src={profile.pfp_url} alt="Profile" className="w-full h-full object-cover" />
                  : <User className="w-10 h-10 text-white" />
                }
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => setShowCropModal(true)}
                  className="absolute inset-0 rounded-full bg-black/55 flex items-center justify-center opacity-0 group-hover/pfp:opacity-100 transition-opacity"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
            <div>
              <h1 className="font-roboto font-bold text-white text-2xl leading-tight">{username}</h1>
              <p className="font-roboto text-white/40 text-sm">{isOwnProfile ? currentUser?.email : ''}</p>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="flex items-center gap-8 py-4 border-b border-white/10 mb-8">
            <div>
              <p className="font-roboto font-bold text-white text-xl leading-none">{userPosts.length}</p>
              <p className="font-roboto text-white/40 text-xs mt-1">Posts</p>
            </div>
            <div>
              <p className="font-roboto font-bold text-white text-xl leading-none">{playedGames.length}</p>
              <p className="font-roboto text-white/40 text-xs mt-1">Games Played</p>
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

          {/* ── Tabs ── */}
          <div className="flex gap-8 mb-8 border-b border-white/10">
            <button 
              onClick={() => setActiveTab('posts')}
              className={`pb-4 font-roboto font-bold text-sm uppercase tracking-widest transition-all relative ${
                activeTab === 'posts' ? 'text-white' : 'text-white/30 hover:text-white/60'
              }`}
            >
              Posts
              {activeTab === 'posts' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#773877] rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('games')}
              className={`pb-4 font-roboto font-bold text-sm uppercase tracking-widest transition-all relative ${
                activeTab === 'games' ? 'text-white' : 'text-white/30 hover:text-white/60'
              }`}
            >
              Games Played
              {activeTab === 'games' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#773877] rounded-t-full" />}
            </button>
          </div>

          {/* ── Content ── */}
          <div className="pb-16">
            {activeTab === 'posts' ? (
              userPosts.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-24">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <LayoutGrid className="w-7 h-7 text-white/15" />
                  </div>
                  <p className="font-roboto text-white/30 text-sm">No posts yet</p>
                  {isOwnProfile && <p className="font-roboto text-white/20 text-xs">Share something with the community!</p>}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {userPosts.map(post => {
                    const isEditing = editingId === post.id
                    const isMenuOpen = openMenuId === post.id
                    const commentsOpen = openCommentsId === post.id

                    const leftPhoto = post.taggedGame?.cover
                      ?? post.gifUrl
                      ?? (post.mediaType === 'image' ? post.mediaUrl : undefined)

                    return (
                      <article key={post.id} className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden flex items-stretch">

                        {/* ── Left photo 200×300 ── */}
                        <div className="w-[200px] h-[300px] shrink-0 overflow-hidden bg-[#1e0628] border-r border-white/10">
                          {leftPhoto ? (
                            <img src={leftPhoto} alt="cover" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-b from-[#773877]/30 to-[#240025] flex items-center justify-center">
                              <Gamepad2 className="w-12 h-12 text-white/10" />
                            </div>
                          )}
                        </div>

                        {/* ── Right column ── */}
                        <div className="flex-1 flex flex-col min-w-0 p-6 min-h-[300px] h-full">

                          {/* User row + ellipsis */}
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#773877] border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
                                {post.pfpUrl
                                  ? <img src={post.pfpUrl} alt="" className="w-full h-full object-cover" />
                                  : <User className="w-5 h-5 text-white" />
                                }
                              </div>
                              <div>
                                <p className="font-roboto font-bold text-white text-base leading-tight">{post.username}</p>
                                <p className="font-roboto text-white/35 text-xs mt-1">{timeAgo(post.createdAt)}</p>
                              </div>
                            </div>

                            {/* Ellipsis */}
                            {isOwnProfile && (
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
                            )}
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
                                <button onClick={() => likePost(post.id, currentUser?.id || '')} className={`flex items-center gap-1.5 text-xs font-roboto transition-colors ${currentUser && post.likedBy.includes(currentUser.id) ? 'text-red-400' : 'text-white/35 hover:text-red-400'}`}>
                                  <Heart className={`w-4 h-4 transition-all ${currentUser && post.likedBy.includes(currentUser.id) ? 'fill-red-400 scale-110' : ''}`} />
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
                                <button onClick={() => repostPost(post.id, currentUser?.id || '')} className={`flex items-center gap-1.5 text-xs font-roboto transition-colors ${currentUser && post.repostedBy.includes(currentUser.id) ? 'text-green-400' : 'text-white/35 hover:text-green-400'}`}>
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
                                  {profile?.pfp_url ? <img src={profile.pfp_url} alt="" className="w-full h-full object-cover" /> : <User className="w-3 h-3 text-white" />}
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
              )
            ) : (
              /* Games Played Grid */
              playedGames.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-24">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <Gamepad2 className="w-7 h-7 text-white/15" />
                  </div>
                  <p className="font-roboto text-white/30 text-sm">No games played yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-6">
                  {playedGames.map(game => (
                    <Link 
                      key={game.id} 
                      to={`/game/${game.game_id}`}
                      className="flex flex-col gap-3 group"
                    >
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-white/10 group-hover:border-[#773877] transition-all shadow-lg bg-[#1e0628]">
                        <img src={game.game_cover} alt={game.game_title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <CheckCircle2 className="w-10 h-10 text-green-400 drop-shadow-lg" />
                        </div>
                      </div>
                      <p className="font-roboto font-medium text-sm text-white/80 group-hover:text-white truncate transition-colors text-center px-1">
                        {game.game_title}
                      </p>
                    </Link>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </main>

      <Footer />

      {showCropModal && (
        <PfpCropModal onClose={() => setShowCropModal(false)} onSave={handlePfpSave} />
      )}

      {showCoverModal && (
        <CoverCropModal onClose={() => setShowCoverModal(false)} onSave={handleCoverSave} />
      )}
    </div>
  )
}
