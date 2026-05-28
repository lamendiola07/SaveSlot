import { useState, useRef, useEffect } from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { Search, UserPlus, MessageCircle, User, Send, X, ShieldCheck, Trash2, ExternalLink, Check, UserMinus, AlertCircle } from 'lucide-react'
import { useAuthStore, useFriendsStore, Friend } from '../store'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

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
            Unfriend
          </button>
        </div>
      </motion.div>
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
    subscribeToMessages 
  } = useFriendsStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [unfriendTarget, setUnfriendTarget] = useState<Friend | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      fetchFriends(user.id)
      fetchDiscoverUsers(user.id)
    }
  }, [user, fetchFriends, fetchDiscoverUsers])

  // Debounced server-side search
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !selectedFriend || !user) return
    sendMessage(user.id, selectedFriend.id, chatInput.trim())
    setChatInput('')
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
        {/* Left Column: Friend List & Discover */}
        <div className="w-[400px] flex flex-col gap-6">
          {/* Find Friends */}
          <div className="bg-[#42135b] rounded-2xl p-6 shadow-xl border border-white/5">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-[#c77fc7]" />
              FIND A FRIEND
            </h2>
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
                <div className="flex-1 bg-[#1e0628] rounded-2xl flex flex-col shadow-2xl border border-white/5 overflow-hidden min-h-[500px]">
                  <div className="p-4 border-b border-white/5 bg-[#2a0838] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-[#c77fc7]" />
                      <span className="text-white font-bold text-sm">DIRECT MESSAGES</span>
                    </div>
                    <button onClick={() => setSelectedFriend(null)} className="text-white/20 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 no-scrollbar">
                    {messages.map(m => (
                      <div 
                        key={m.id} 
                        className={`flex flex-col ${m.sender_id === user.id ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`max-w-[70%] p-3 px-4 rounded-2xl text-sm font-roboto shadow-lg ${
                          m.sender_id === user.id 
                            ? 'bg-[#773877] text-white rounded-tr-none' 
                            : 'bg-white/10 text-white rounded-tl-none border border-white/5'
                        }`}>
                          {m.content}
                        </div>
                        <span className="text-[10px] text-white/20 mt-1 uppercase font-bold">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                    {messages.length === 0 && (
                      <div className="flex-1 flex flex-col items-center justify-center text-white/10 gap-4">
                        <MessageCircle className="w-16 h-16" />
                        <p className="font-bold tracking-widest">START A CONVERSATION</p>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="p-4 bg-[#2a0838] border-t border-white/5 flex gap-3">
                    <input 
                      type="text"
                      placeholder={`Message @${selectedFriend.username}...`}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-roboto outline-none focus:border-[#773877] transition-all"
                    />
                    <button 
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="w-12 h-12 rounded-xl bg-[#773877] text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all shadow-lg"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
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

      <Footer />
    </div>
  )
}
