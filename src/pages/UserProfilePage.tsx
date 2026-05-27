import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Heart, LayoutGrid, Calendar, MoreHorizontal, Pencil, Trash2, Gamepad2 } from 'lucide-react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
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

export function UserProfilePage() {
  const { user, isAuthenticated } = useAuthStore()
  const { posts, likePost, editPost, deletePost } = usePostsStore()
  const navigate = useNavigate()

  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'
  const pfpUrl = user?.id ? localStorage.getItem(`pfp_${user.id}`) : null
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : ''

  const userPosts = posts.filter(p => p.userId === user?.id)
  const totalLikes = userPosts.reduce((acc, p) => acc + p.likes, 0)

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth')
  }, [isAuthenticated, navigate])

  const startEdit = (postId: string, currentContent: string) => {
    setEditingId(postId)
    setEditContent(currentContent)
    setOpenMenuId(null)
  }

  const saveEdit = () => {
    if (editingId) editPost(editingId, editContent)
    setEditingId(null)
    setEditContent('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const handleDelete = (postId: string) => {
    deletePost(postId)
    setOpenMenuId(null)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#803da4] to-[#240025] flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Banner */}
        <div className="w-full h-44 bg-gradient-to-r from-[#773877] via-[#5a2160] to-[#240025] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(199,127,199,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(119,56,119,0.2),transparent_60%)]" />
        </div>

        <div className="max-w-3xl mx-auto px-4">
          {/* Pfp + name — overlaps banner */}
          <div className="flex items-end gap-5 -mt-12 mb-5">
            <div className="w-24 h-24 rounded-full bg-[#773877] border-4 border-[#240025] flex items-center justify-center overflow-hidden shrink-0 shadow-xl">
              {pfpUrl
                ? <img src={pfpUrl} alt="Profile" className="w-full h-full object-cover" />
                : <User className="w-10 h-10 text-white" />
              }
            </div>
            <div className="pb-1">
              <h1 className="font-roboto font-bold text-white text-2xl leading-tight">{username}</h1>
              <p className="font-roboto text-white/40 text-sm">{user.email}</p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-8 py-4 border-y border-white/10 mb-8">
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

          {/* Posts section */}
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
              <div className="flex flex-col gap-4">
                {userPosts.map(post => {
                  const liked = post.likedBy.includes(user.id)
                  const isEditing = editingId === post.id
                  const isMenuOpen = openMenuId === post.id

                  return (
                    <article
                      key={post.id}
                      className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden"
                    >
                      {/* Post header */}
                      <div className="flex items-center gap-3 px-5 pt-4 pb-3">
                        <div className="w-9 h-9 rounded-full bg-[#773877] border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
                          {post.pfpUrl
                            ? <img src={post.pfpUrl} alt="" className="w-full h-full object-cover" />
                            : <User className="w-4 h-4 text-white" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-roboto font-semibold text-white text-sm">{post.username}</p>
                          <p className="font-roboto text-white/35 text-xs">{timeAgo(post.createdAt)}</p>
                        </div>

                        {/* Ellipsis menu */}
                        <div className="relative shrink-0">
                          <button
                            onClick={() => setOpenMenuId(isMenuOpen ? null : post.id)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <>
                              {/* Click-outside backdrop */}
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenuId(null)}
                              />
                              {/* Dropdown */}
                              <div className="absolute right-0 top-full mt-1 w-36 bg-[#2a0838] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20">
                                <button
                                  onClick={() => startEdit(post.id, post.content)}
                                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 transition-colors text-sm font-roboto"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-[#c77fc7]" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(post.id)}
                                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-white/70 hover:text-red-400 hover:bg-white/5 transition-colors text-sm font-roboto"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-400/70" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Content — editable or static */}
                      {isEditing ? (
                        <div className="px-5 pb-3">
                          <textarea
                            autoFocus
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            rows={4}
                            className="w-full bg-white/5 border border-white/20 focus:border-[#773877] rounded-xl px-3 py-2.5 text-white text-sm font-roboto placeholder:text-white/25 resize-none outline-none transition-colors"
                          />
                        </div>
                      ) : (
                        post.content && (
                          <p className="font-roboto text-white/90 text-sm px-5 pb-3 leading-relaxed">
                            {post.content}
                          </p>
                        )
                      )}

                      {/* Tagged game */}
                      {post.taggedGame && (
                        <div className="px-5 pb-3">
                          <div className="inline-flex items-center gap-2 bg-[#773877]/15 border border-[#773877]/30 rounded-xl px-3 py-1.5 max-w-full">
                            <img
                              src={post.taggedGame.cover}
                              alt={post.taggedGame.title}
                              className="w-14 h-10 rounded-lg object-cover shrink-0 bg-white/10"
                            />
                            <Gamepad2 className="w-3 h-3 text-orange-400 shrink-0" />
                            <span className="font-roboto text-[#c77fc7] text-xs font-medium truncate">
                              {post.taggedGame.title}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Tagged users */}
                      {post.taggedUsers.length > 0 && (
                        <div className="px-5 pb-3 flex flex-wrap gap-2">
                          {post.taggedUsers.map(tag => (
                            <span
                              key={tag}
                              className="font-roboto text-[#c77fc7] text-xs bg-[#773877]/20 px-2 py-0.5 rounded-full"
                            >
                              @{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Media */}
                      {post.mediaUrl && (
                        <div className="px-5 pb-4">
                          {post.mediaType === 'image'
                            ? <img src={post.mediaUrl} alt="Post media" className="w-full rounded-xl object-cover max-h-[480px] bg-black/30" />
                            : <video src={post.mediaUrl} controls className="w-full rounded-xl max-h-[480px]" />
                          }
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3 px-5 py-3 border-t border-white/5">
                        {isEditing ? (
                          <>
                            <button
                              onClick={saveEdit}
                              className="bg-[#773877] hover:bg-[#8f4a8f] text-white text-xs font-roboto font-medium px-4 py-1.5 rounded-lg transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="bg-white/10 hover:bg-white/20 text-white/70 text-xs font-roboto px-4 py-1.5 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => likePost(post.id, user.id)}
                            className={`flex items-center gap-1.5 text-xs font-roboto transition-colors ${
                              liked ? 'text-red-400' : 'text-white/35 hover:text-red-400'
                            }`}
                          >
                            <Heart className={`w-4 h-4 transition-all ${liked ? 'fill-red-400 scale-110' : ''}`} />
                            <span>{post.likes > 0 ? post.likes : ''}</span>
                          </button>
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
    </div>
  )
}
