import { useState, useRef, useEffect } from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { 
  Search, UserPlus, MessageCircle, User, Send, X, ShieldCheck, 
  Trash2, ExternalLink, Check, UserMinus, AlertCircle, MoreVertical, 
  Pencil, Pin, PinOff, Paperclip, Smile, FileIcon
} from 'lucide-react'
import { useAuthStore, useFriendsStore, Friend, ChatMessage } from '../store'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'

// Tenor public demo key
const TENOR_KEY = 'LIVDSRZULELA'

async function fetchTenorGifs(query: string) {
  const params = new URLSearchParams({
    key: TENOR_KEY,
    limit: '20',
    contentfilter: 'medium',
    media_filter: 'tinygif,gif',
  })
  const base = 'https://tenor.googleapis.com/v2'
  const url = query.trim()
    ? `${base}/search?${params}&q=${encodeURIComponent(query.trim())}`
    : `${base}/featured?${params}`
  const res = await fetch(url)
  const json = await res.json()
  return (json.results as any[]).map(g => ({
    id: g.id as string,
    url: g.media_formats.gif.url as string,
    preview: g.media_formats.tinygif.url as string,
  }))
}

const EMOJIS = ['😊', '😂', '🔥', '🎮', '🕹️', '❤️', '👍', '🙌', '🎉', '😢', '😮', '🤔', '😎', '💀', '✨']
const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡']

function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#2a0838] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-red-400 mb-4">
          <AlertCircle className="w-6 h-6" />
          <h3 className="text-lg font-bold uppercase tracking-tight">{title}</h3>
        </div>
        <p className="text-white/70 text-sm font-roboto leading-relaxed mb-6">
          {message}
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function ReactionPicker({ onSelect, onClose }: { onSelect: (emoji: string) => void, onClose: () => void }) {
  return (
    <div className="flex items-center gap-1 bg-[#1e0628] border border-white/10 rounded-full px-2 py-1 shadow-2xl animate-in fade-in zoom-in duration-200">
      {REACTION_EMOJIS.map(emoji => (
        <button 
          key={emoji}
          onClick={() => { onSelect(emoji); onClose(); }}
          className="hover:scale-125 transition-transform px-1 text-lg"
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

function MessageItem({ 
  msg, 
  isOwn, 
  currentUserId,
  onEdit, 
  onDelete, 
  onPin,
  onReact 
}: { 
  msg: ChatMessage, 
  isOwn: boolean, 
  currentUserId: string,
  onEdit: (id: string, content: string) => Promise<void>,
  onDelete: (id: string) => void,
  onPin: (id: string, isPinned: boolean) => void,
  onReact: (id: string, emoji: string) => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditContent] = useState(msg.content || '')
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
        setShowReactions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSave = async () => {
    if (editValue.trim() && editValue !== msg.content) {
      await onEdit(msg.id, editValue.trim())
    }
    setIsEditing(false)
  }

  const msgReactions = msg.reactions || {}

  return (
    <div className={`group flex flex-col ${isOwn ? 'items-end' : 'items-start'} relative mb-2`}>
      <div className={`flex items-center gap-2 max-w-[85%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Actions Menu */}
        {!isEditing && (
          <div className="relative flex items-center gap-1" ref={menuRef}>
            {/* Reaction Trigger */}
            <button 
              onClick={() => setShowReactions(!showReactions)}
              className="p-1 rounded-full hover:bg-white/10 text-white/20 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              title="Add reaction"
            >
              <Smile className="w-4 h-4" />
            </button>

            {showReactions && (
              <div className={`absolute bottom-full mb-2 ${isOwn ? 'right-0' : 'left-0'} z-20`}>
                <ReactionPicker 
                  onSelect={(emoji) => onReact(msg.id, emoji)}
                  onClose={() => setShowReactions(false)}
                />
              </div>
            )}

            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full hover:bg-white/10 text-white/20 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            <AnimatePresence>
              {showMenu && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 5 }}
                  className={`absolute ${isOwn ? 'right-full mr-2' : 'left-full ml-2'} bottom-0 z-10 w-32 bg-[#2a0838] border border-white/10 rounded-xl shadow-2xl overflow-hidden`}
                >
                  {isOwn && (
                    <button 
                      onClick={() => { setIsEditing(true); setShowMenu(false); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 transition-colors text-xs font-roboto"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#c77fc7]" /> Edit
                    </button>
                  )}
                  <button 
                    onClick={() => { onPin(msg.id, !msg.is_pinned); setShowMenu(false); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 transition-colors text-xs font-roboto"
                  >
                    {msg.is_pinned ? <PinOff className="w-3.5 h-3.5 text-orange-400" /> : <Pin className="w-3.5 h-3.5 text-orange-400" />}
                    {msg.is_pinned ? 'Unpin' : 'Pin'}
                  </button>
                  {isOwn && (
                    <button 
                      onClick={() => { onDelete(msg.id); setShowMenu(false); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-xs font-roboto"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Message Bubble */}
        <div className={`p-3 px-4 rounded-2xl text-sm font-roboto shadow-lg relative ${
          isOwn 
            ? 'bg-[#773877] text-white rounded-tr-none' 
            : 'bg-white/10 text-white rounded-tl-none border border-white/5'
        }`}>
          {msg.is_pinned && <Pin className="w-3 h-3 text-orange-400 absolute -top-1.5 -right-1.5 fill-orange-400" />}
          
          {msg.media_url && !isEditing && (
            <div className="mb-2 max-w-full overflow-hidden rounded-lg">
              {msg.media_type === 'image' || msg.media_type === 'gif' ? (
                <img src={msg.media_url} alt="" className="w-full h-auto object-cover max-h-60" />
              ) : msg.media_type === 'video' ? (
                <video src={msg.media_url} controls className="w-full max-h-60" />
              ) : (
                <a href={msg.media_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-black/20 rounded hover:bg-black/30 transition-colors">
                  <FileIcon className="w-4 h-4" />
                  <span className="text-xs truncate max-w-[150px]">File Attachment</span>
                </a>
              )}
            </div>
          )}
          
          {isEditing ? (
            <div className="flex flex-col gap-2 min-w-[200px]">
              <textarea 
                autoFocus
                value={editValue}
                onChange={e => setEditContent(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); }
                  if (e.key === 'Escape') { setIsEditing(false); setEditContent(msg.content || ''); }
                }}
                className="w-full bg-white/5 border border-white/20 rounded-lg p-2 text-white text-xs outline-none focus:border-[#c77fc7] resize-none"
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsEditing(false)} className="text-[10px] opacity-60 hover:opacity-100">Cancel</button>
                <button onClick={handleSave} className="text-[10px] font-bold text-[#c77fc7] hover:brightness-125">Save</button>
              </div>
            </div>
          ) : (
            <>
              {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
              {msg.is_edited && <span className="text-[9px] opacity-40 ml-1">(edited)</span>}
            </>
          )}

          {/* Inline Reactions */}
          {Object.keys(msgReactions).length > 0 && (
            <div className={`absolute top-full -mt-2 flex flex-wrap gap-1 ${isOwn ? 'right-2' : 'left-2'} z-10`}>
              {Object.entries(msgReactions).map(([emoji, users]) => (
                <button 
                  key={emoji}
                  onClick={() => onReact(msg.id, emoji)}
                  className={`flex items-center gap-1.5 bg-[#1e0628] border border-white/10 rounded-full px-1.5 py-0.5 text-[10px] transition-all hover:border-[#773877] ${users.includes(currentUserId) ? 'border-[#773877] bg-[#773877]/20' : ''}`}
                >
                  <span>{emoji}</span>
                  {users.length > 1 && <span className="text-white/60 font-bold">{users.length}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <span className="text-[10px] text-white/20 mt-1 uppercase font-bold px-1">
        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  )
}

export function FriendsPage() {
  const { user } = useAuthStore()
  const { 
    friends, 
    pendingRequests,
    discoverUsers, 
    messages, 
    loading, 
    fetchFriends, 
    fetchDiscoverUsers, 
    addFriend, 
    acceptFriend,
    removeFriend, 
    sendMessage,
    addReaction,
    editMessage,
    deleteMessage,
    togglePinMessage,
    subscribeToMessages 
  } = useFriendsStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [unfriendTarget, setUnfriendTarget] = useState<Friend | null>(null)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  
  // Media states
  const [showGifPanel, setShowGifPanel] = useState(false)
  const [gifQuery, setGifQuery] = useState('')
  const [gifResults, setGifResults] = useState<any[]>([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      fetchFriends(user.id)
      fetchDiscoverUsers(user.id)
    }
  }, [user, fetchFriends, fetchDiscoverUsers])

  useEffect(() => {
    if (!user) return
    const timer = setTimeout(() => {
      fetchDiscoverUsers(user.id, searchQuery)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery, user, fetchDiscoverUsers])

  useEffect(() => {
    if (user && selectedFriend) {
      const unsubscribe = subscribeToMessages(user.id, selectedFriend.id)
      return () => unsubscribe()
    }
  }, [user, selectedFriend, subscribeToMessages])

  // Auto-scroll logic with "near bottom" check
  useEffect(() => {
    const container = chatContainerRef.current
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200
      if (isNearBottom) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [messages])

  // GIF search
  useEffect(() => {
    if (!showGifPanel) return
    const t = setTimeout(async () => {
      try { setGifResults(await fetchTenorGifs(gifQuery)) }
      catch { setGifResults([]) }
    }, 350)
    return () => clearTimeout(t)
  }, [gifQuery, showGifPanel])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if ((!chatInput.trim() && !uploading) || !selectedFriend || !user) return
    
    if (editingMessageId) {
      editMessage(editingMessageId, chatInput.trim())
      setEditingMessageId(null)
    } else {
      sendMessage(user.id, selectedFriend.id, chatInput.trim())
    }
    setChatInput('')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user || !selectedFriend) return
    
    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large! Maximum size is 10MB.")
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `chats/${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('chat_media')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('chat_media')
        .getPublicUrl(filePath)

      let type: 'image' | 'video' | 'file' = 'file'
      if (file.type.startsWith('image/')) type = 'image'
      else if (file.type.startsWith('video/')) type = 'video'

      await sendMessage(user.id, selectedFriend.id, null, { url: publicUrl, type })
    } catch (err) {
      console.error("Upload error:", err)
      alert("Failed to upload file.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const selectGif = (url: string) => {
    if (!user || !selectedFriend) return
    sendMessage(user.id, selectedFriend.id, null, { url, type: 'gif' })
    setShowGifPanel(false)
  }

  const handleUnfriend = async (friend: Friend, e: React.MouseEvent) => {
    e.stopPropagation()
    setUnfriendTarget(friend)
  }

  const confirmUnfriend = async () => {
    if (!user || !unfriendTarget) return
    await removeFriend(user.id, unfriendTarget.id)
    if (selectedFriend?.id === unfriendTarget.id) setSelectedFriend(null)
    setUnfriendTarget(null)
  }

  const confirmDeleteMessage = async () => {
    if (messageToDelete) {
      await deleteMessage(messageToDelete)
      setMessageToDelete(null)
    }
  }

  const pinnedMessages = messages.filter(m => m.is_pinned)

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center text-white p-4">
          <ShieldCheck className="w-16 h-16 text-[#773877] mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sign in to find friends</h1>
          <p className="text-white/60">Connect with other gamers and start chatting!</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#240025]">
      <Header />
      
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-12 py-12 flex gap-8">
        {/* ... (Left Column remains same) ... */}
        <div className="w-[400px] flex flex-col gap-6">
          {/* Find Friends */}
          <div className="bg-[#42135b] rounded-2xl p-6 shadow-xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-[#c77fc7]" />
                FIND A FRIEND
              </h2>
              <button 
                onClick={() => fetchDiscoverUsers(user.id)}
                className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors"
              >
                Shuffle
              </button>
            </div>
            <div className="relative">
              <input 
                type="text"
                placeholder="Search username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 bg-white/10 border border-white/10 rounded-xl px-4 text-white font-roboto outline-none focus:border-[#773877] transition-all"
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 max-h-[300px] overflow-y-auto no-scrollbar">
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest px-1">Discover Users</p>
              {loading && <p className="text-white/40 text-xs px-1">Loading users...</p>}
              {discoverUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#773877] flex items-center justify-center border border-white/10 overflow-hidden">
                      {u.pfp_url ? <img src={u.pfp_url} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-white" />}
                    </div>
                    <span className="text-white font-medium text-sm">{u.username}</span>
                  </div>
                  <button 
                    onClick={() => addFriend(user.id, u.id)}
                    className="p-2 rounded-lg bg-white/10 text-white hover:bg-[#773877] transition-all"
                    title="Add Friend"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {!loading && discoverUsers.length === 0 && (
                <p className="text-center py-4 text-white/20 text-sm">No users found</p>
              )}
            </div>
          </div>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="bg-[#42135b] rounded-2xl p-6 shadow-xl border border-white/5">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                Friend Requests
              </h2>
              <div className="flex flex-col gap-3">
                {pendingRequests.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#773877] flex items-center justify-center border border-white/10 overflow-hidden">
                        {r.pfp_url ? <img src={r.pfp_url} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-white" />}
                      </div>
                      <span className="text-white font-medium text-sm truncate max-w-[120px]">{r.username}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => acceptFriend(user.id, r.id)}
                        className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-all"
                        title="Accept"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeFriend(user.id, r.id)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          <div className="bg-[#42135b] rounded-2xl p-6 shadow-xl border border-white/5 flex-1 min-h-[400px]">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
              Your Friends
            </h2>
            <div className="flex flex-col gap-2">
              {friends.map(f => (
                <div 
                  key={f.id} 
                  onClick={() => setSelectedFriend(f)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all group ${
                    selectedFriend?.id === f.id ? 'bg-[#773877] shadow-lg' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-[#331442] flex items-center justify-center border border-white/10 overflow-hidden">
                        {f.pfp_url ? <img src={f.pfp_url} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-white" />}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#42135b] ${
                        f.status === 'Online' ? 'bg-green-400' : 
                        f.status === 'In-game' ? 'bg-blue-400' : 'bg-white/20'
                      }`} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-sm leading-none">{f.username}</span>
                      <span className="text-white/40 text-[11px] mt-1">{f.status}</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleUnfriend(f, e)}
                    className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Unfriend"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {friends.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-20">
                  <UserPlus className="w-12 h-12" />
                  <p className="text-sm font-roboto">No friends added yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Profile & Chat */}
        <div className="flex-1 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {selectedFriend ? (
              <motion.div 
                key={selectedFriend.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col h-full gap-6"
              >
                {/* Friend Header/Profile */}
                <div className="bg-[#42135b] rounded-2xl p-8 shadow-xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-[#773877] flex items-center justify-center border-4 border-[#240025] shadow-2xl overflow-hidden">
                      {selectedFriend.pfp_url ? <img src={selectedFriend.pfp_url} alt="" className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-white" />}
                    </div>
                    <div className="flex flex-col">
                      <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">{selectedFriend.username}</h1>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`w-3 h-3 rounded-full ${
                          selectedFriend.status === 'Online' ? 'bg-green-400' : 
                          selectedFriend.status === 'In-game' ? 'bg-blue-400' : 'bg-white/20'
                        }`} />
                        <span className="text-white/60 font-medium">{selectedFriend.status}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all border border-white/5"
                    onClick={() => navigate(`/profile/${selectedFriend.id}`)}
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Profile
                  </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-[#1e0628] rounded-2xl flex flex-col shadow-2xl border border-white/5 overflow-hidden min-h-[500px] max-h-[800px]">
                  {/* Pinned Banner */}
                  {pinnedMessages.length > 0 && (
                    <div className="bg-orange-500/10 border-b border-orange-500/20 px-4 py-2 flex items-center gap-3">
                      <Pin className="w-4 h-4 text-orange-400 fill-orange-400 shrink-0" />
                      <div className="flex-1 overflow-x-auto no-scrollbar whitespace-nowrap flex gap-4">
                        {pinnedMessages.map(pm => (
                          <div key={pm.id} className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded text-[11px] text-white/80">
                            <span className="truncate max-w-[150px]">{pm.content || (pm.media_type === 'gif' ? 'GIF' : 'Media')}</span>
                            <button onClick={() => togglePinMessage(pm.id, false)} className="hover:text-white"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 border-b border-white/5 bg-[#2a0838] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-[#c77fc7]" />
                      <span className="text-white font-bold text-sm uppercase tracking-wider">Direct Messages</span>
                    </div>
                    <button onClick={() => setSelectedFriend(null)} className="text-white/20 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div 
                    ref={chatContainerRef}
                    className="flex-1 p-6 overflow-y-auto scrollbar-gutter-stable flex flex-col gap-6 scrollbar-custom"
                  >
                    {messages.map(m => (
                      <MessageItem 
                        key={m.id} 
                        msg={m} 
                        isOwn={m.sender_id === user.id} 
                        currentUserId={user.id}
                        onEdit={async (id, content) => {
                          await editMessage(id, content)
                        }}
                        onDelete={(id) => setMessageToDelete(id)}
                        onPin={(id, isPinned) => togglePinMessage(id, isPinned)}
                        onReact={(id, emoji) => addReaction(id, user.id, emoji)}
                      />
                    ))}
                    <div ref={chatEndRef} className="h-4" />
                    {messages.length === 0 && (
                      <div className="flex-1 flex flex-col items-center justify-center text-white/10 gap-4">
                        <MessageCircle className="w-16 h-16" />
                        <p className="font-bold tracking-widest">START A CONVERSATION</p>
                      </div>
                    )}
                  </div>

                  {/*Rich Input */}
                  <div className="p-4 bg-[#2a0838] border-t border-white/5 flex flex-col gap-3">
                    <AnimatePresence>
                      {showGifPanel && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 250, opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-black/20 rounded-xl overflow-hidden flex flex-col"
                        >
                          <div className="p-2 border-b border-white/5 flex gap-2">
                            <input 
                              autoFocus
                              type="text" 
                              placeholder="Search GIFs..." 
                              value={gifQuery}
                              onChange={e => setGifQuery(e.target.value)}
                              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-white outline-none"
                            />
                            <button onClick={() => setShowGifPanel(false)}><X className="w-4 h-4 text-white/40" /></button>
                          </div>
                          <div className="flex-1 overflow-y-auto p-2 grid grid-cols-4 gap-2 no-scrollbar">
                            {gifResults.map(g => (
                              <img 
                                key={g.id} 
                                src={g.preview} 
                                alt="" 
                                onClick={() => selectGif(g.url)}
                                className="w-full aspect-video object-cover rounded cursor-pointer hover:scale-105 transition-transform" 
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {showEmojiPicker && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-black/20 rounded-xl p-3 grid grid-cols-8 gap-2"
                        >
                          {EMOJIS.map(e => (
                            <button 
                              key={e} 
                              onClick={() => { setChatInput(prev => prev + e); setShowEmojiPicker(false); }}
                              className="text-xl hover:scale-125 transition-transform"
                            >
                              {e}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <button 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="w-10 h-10 rounded-xl hover:bg-white/10 text-white/40 hover:text-[#c77fc7] transition-all flex items-center justify-center"
                          title="Attach file"
                        >
                          {uploading ? <div className="w-4 h-4 border-2 border-[#c77fc7] border-t-transparent rounded-full animate-spin" /> : <Paperclip className="w-5 h-5" />}
                        </button>
                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
                        
                        <button 
                          type="button"
                          onClick={() => { setShowGifPanel(!showGifPanel); setShowEmojiPicker(false); }}
                          className={`w-10 h-10 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center font-bold text-xs ${showGifPanel ? 'text-[#c77fc7]' : 'text-white/40'}`}
                          title="Send GIF"
                        >
                          GIF
                        </button>

                        <button 
                          type="button"
                          onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowGifPanel(false); }}
                          className={`w-10 h-10 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center ${showEmojiPicker ? 'text-[#c77fc7]' : 'text-white/40'}`}
                          title="Emoji"
                        >
                          <Smile className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex-1 relative">
                        <input 
                          type="text"
                          placeholder={editingMessageId ? "Edit message..." : `Message @${selectedFriend.username}...`}
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          className={`w-full h-12 bg-white/5 border rounded-xl px-4 text-white font-roboto outline-none transition-all ${editingMessageId ? 'border-orange-500/50' : 'border-white/10 focus:border-[#773877]'}`}
                        />
                        {editingMessageId && (
                          <button 
                            type="button"
                            onClick={() => { setEditingMessageId(null); setChatInput(''); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <button 
                        type="submit"
                        disabled={!chatInput.trim() || uploading}
                        className="w-12 h-12 rounded-xl bg-[#773877] text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shrink-0"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 bg-[#1e0628]/50 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-white/20 gap-4">
                <User className="w-20 h-20" />
                <p className="text-xl font-bold uppercase tracking-[0.2em]">Select a friend to start chatting</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <ConfirmModal 
        isOpen={!!unfriendTarget}
        onClose={() => setUnfriendTarget(null)}
        onConfirm={confirmUnfriend}
        title="Unfriend"
        message={`Are you sure you want to remove ${unfriendTarget?.username} from your friends? You won't be able to chat until you reconnect.`}
      />

      <ConfirmModal 
        isOpen={!!messageToDelete}
        onClose={() => setMessageToDelete(null)}
        onConfirm={confirmDeleteMessage}
        title="Delete Message"
        message="Are you sure you want to permanently delete this message? This action cannot be undone."
      />

      <Footer />
    </div>
  )
}
