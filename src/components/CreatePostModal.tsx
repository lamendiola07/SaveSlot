import { useState, useRef, useEffect } from 'react'
import { X, Image, Tag, Globe, ChevronDown, VideoIcon, Gamepad2, Search } from 'lucide-react'
import { User } from 'lucide-react'
import { useAuthStore, usePostsStore, TaggedGame } from '../store'
import { fetchRawgGames } from '../services/rawgApi'
import type { Game } from '../types/game'

interface Props {
  onClose: () => void
  pfpUrl: string | null
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function CreatePostModal({ onClose, pfpUrl }: Props) {
  const { user } = useAuthStore()
  const { addPost } = usePostsStore()
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'

  const [content, setContent] = useState('')
  const [media, setMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [showTagInput, setShowTagInput] = useState(false)
  const [posting, setPosting] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  // Game search
  const [showGameSearch, setShowGameSearch] = useState(false)
  const [gameQuery, setGameQuery] = useState('')
  const [gameResults, setGameResults] = useState<Game[]>([])
  const [gameSearching, setGameSearching] = useState(false)
  const [taggedGame, setTaggedGame] = useState<TaggedGame | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)

  // Debounced game search
  useEffect(() => {
    if (!gameQuery.trim()) { setGameResults([]); return }
    setGameSearching(true)
    const timer = setTimeout(async () => {
      try {
        const { games } = await fetchRawgGames({ search: gameQuery, page_size: '6' })
        setGameResults(games)
      } catch {
        setGameResults([])
      } finally {
        setGameSearching(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [gameQuery])

  const selectGame = (game: Game) => {
    setTaggedGame({ id: game.id, title: game.title, cover: game.img })
    setShowGameSearch(false)
    setGameQuery('')
    setGameResults([])
  }

  const applyFile = async (file: File) => {
    if (file.type.startsWith('video')) {
      setMedia({ url: URL.createObjectURL(file), type: 'video' })
    } else {
      setMedia({ url: await readAsDataURL(file), type: 'image' })
    }
  }

  const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await applyFile(file)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && (file.type.startsWith('image') || file.type.startsWith('video'))) {
      await applyFile(file)
    }
  }

  const addTag = () => {
    const trimmed = tagInput.trim().replace(/^@/, '')
    if (trimmed && !tags.includes(trimmed)) setTags(prev => [...prev, trimmed])
    setTagInput('')
  }

  const handlePost = async () => {
    if (!content.trim() && !media) return
    if (!user) return
    setPosting(true)
    addPost({
      userId: user.id,
      username,
      pfpUrl,
      content: content.trim(),
      mediaUrl: media?.url,
      mediaType: media?.type,
      taggedUsers: tags,
      taggedGame: taggedGame ?? undefined,
    })
    setPosting(false)
    onClose()
  }

  const canPost = (content.trim().length > 0 || !!media) && !posting

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#2a0838] border border-white/10 rounded-2xl w-[520px] shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex items-center justify-center px-6 py-4 border-b border-white/10 shrink-0">
          <h2 className="font-roboto font-semibold text-white text-base">Create Post</h2>
          <button
            onClick={onClose}
            className="absolute right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto max-h-[70vh]">
          {/* User info */}
          <div className="flex items-center gap-3 px-4 pt-4">
            <div className="w-10 h-10 rounded-full bg-[#773877] border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
              {pfpUrl
                ? <img src={pfpUrl} alt="pfp" className="w-full h-full object-cover" />
                : <User className="w-5 h-5 text-white" />
              }
            </div>
            <div>
              <p className="font-roboto font-semibold text-white text-sm">{username}</p>
              <button className="flex items-center gap-1 bg-white/10 hover:bg-white/15 transition-colors rounded px-2 py-0.5 mt-0.5">
                <Globe className="w-3 h-3 text-white/60" />
                <span className="font-roboto text-white/60 text-[11px]">Public</span>
                <ChevronDown className="w-3 h-3 text-white/60" />
              </button>
            </div>
          </div>

          {/* Textarea */}
          <div className="px-4 pt-3 pb-1">
            <textarea
              autoFocus
              placeholder={`What's on your mind, ${username}?`}
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={4}
              className="w-full bg-transparent text-white font-roboto text-base placeholder:text-white/25 resize-none outline-none"
            />
          </div>

          {/* Tagged game chip */}
          {taggedGame && (
            <div className="px-4 pb-2">
              <div className="inline-flex items-center gap-2 bg-[#773877]/20 border border-[#773877]/40 rounded-xl px-3 py-1.5 max-w-full">
                <img
                  src={taggedGame.cover}
                  alt={taggedGame.title}
                  className="w-14 h-10 rounded-lg object-cover shrink-0 bg-white/10"
                />
                <div className="flex items-center gap-1.5 min-w-0">
                  <Gamepad2 className="w-3 h-3 text-orange-400 shrink-0" />
                  <span className="font-roboto text-[#c77fc7] text-xs font-medium truncate">
                    {taggedGame.title}
                  </span>
                </div>
                <button
                  onClick={() => setTaggedGame(null)}
                  className="text-white/30 hover:text-white transition-colors shrink-0 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Tagged users chips */}
          {tags.length > 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-[#773877]/30 text-[#c77fc7] text-xs font-roboto px-2.5 py-0.5 rounded-full"
                >
                  @{tag}
                  <button
                    onClick={() => setTags(prev => prev.filter(t => t !== tag))}
                    className="hover:text-white transition-colors ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Tag people input */}
          {showTagInput && (
            <div className="px-4 pb-3 flex items-center gap-2">
              <span className="text-[#c77fc7] text-sm font-roboto font-medium">@</span>
              <input
                autoFocus
                type="text"
                placeholder="Type a username and press Enter"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-xs font-roboto placeholder:text-white/30 outline-none focus:border-[#773877] transition-colors"
              />
              <button
                onClick={addTag}
                className="bg-[#773877] hover:bg-[#8f4a8f] text-white text-xs font-roboto px-3 py-1.5 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
          )}

          {/* Game search panel */}
          {showGameSearch && (
            <div className="px-4 pb-3">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search for a game…"
                  value={gameQuery}
                  onChange={e => setGameQuery(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 focus:border-[#773877] rounded-xl pl-8 pr-8 py-2 text-white text-xs font-roboto placeholder:text-white/30 outline-none transition-colors"
                />
                {gameSearching && (
                  <div className="absolute right-3 w-3.5 h-3.5 border border-white/40 border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {/* Results */}
              {gameResults.length > 0 && (
                <div className="mt-2 rounded-xl border border-white/10 bg-[#1e0628] overflow-hidden max-h-52 overflow-y-auto">
                  {gameResults.map(game => (
                    <button
                      key={game.id}
                      onClick={() => selectGame(game)}
                      className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left"
                    >
                      <img
                        src={game.img}
                        alt={game.title}
                        className="w-20 h-14 rounded-lg object-cover shrink-0 bg-white/10"
                      />
                      <span className="font-roboto text-white text-xs truncate">{game.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {!gameSearching && gameQuery.trim().length > 0 && gameResults.length === 0 && (
                <p className="text-center text-white/25 text-xs font-roboto mt-3">No games found</p>
              )}
            </div>
          )}

          {/* Media preview */}
          {media ? (
            <div className="px-4 pb-3">
              <div className="relative rounded-xl overflow-hidden bg-black/40 border border-white/10">
                {media.type === 'image'
                  ? <img src={media.url} alt="preview" className="w-full max-h-64 object-contain" />
                  : <video src={media.url} controls className="w-full max-h-64" />
                }
                <button
                  onClick={() => { setMedia(null); if (fileRef.current) fileRef.current.value = '' }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`mx-4 mb-3 border-2 border-dashed rounded-xl py-6 flex flex-col items-center gap-2 cursor-pointer transition-colors ${
                dragOver ? 'border-[#773877] bg-[#773877]/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Image className="w-5 h-5 text-green-400" />
                <VideoIcon className="w-5 h-5 text-blue-400" />
              </div>
              <p className="font-roboto text-white/35 text-xs">Add photos or videos, or drag & drop here</p>
            </div>
          )}
        </div>

        {/* Action bar + Post button */}
        <div className="px-4 pb-4 pt-2 shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between border border-white/10 rounded-xl px-3 py-2">
            <span className="font-roboto text-white/50 text-sm font-medium">Add to your post</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fileRef.current?.click()}
                title="Photo / Video"
                className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors group"
              >
                <Image className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => { setShowTagInput(v => !v); setShowGameSearch(false) }}
                title="Tag People"
                className={`w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors group ${showTagInput ? 'bg-white/10' : ''}`}
              >
                <Tag className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => { setShowGameSearch(v => !v); setShowTagInput(false); setGameQuery(''); setGameResults([]) }}
                title="Tag a Game"
                className={`w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors group ${showGameSearch ? 'bg-white/10' : ''}`}
              >
                <Gamepad2 className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
              </button>
              <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleMediaChange} className="hidden" />
            </div>
          </div>

          <button
            onClick={handlePost}
            disabled={!canPost}
            className="w-full bg-[#773877] hover:bg-[#8f4a8f] disabled:opacity-35 disabled:cursor-not-allowed text-white font-roboto font-semibold text-sm py-2.5 rounded-xl transition-colors"
          >
            {posting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  )
}
