import { useState, useRef, useEffect } from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { Search, UserPlus, MessageCircle, User, Send, X, ShieldCheck } from 'lucide-react'
import { useAuthStore, useFriendsStore, Friend } from '../store'
import { motion, AnimatePresence } from 'framer-motion'

// Mock discoverable users
const DISCOVER_USERS: Friend[] = [
  { id: 'u1', username: 'GamerPro99', pfpUrl: null, status: 'Online' },
  { id: 'u2', username: 'PixelKnight', pfpUrl: null, status: 'In-game' },
  { id: 'u3', username: 'ShadowWalker', pfpUrl: null, status: 'Online' },
  { id: 'u4', username: 'CyberQueen', pfpUrl: null, status: 'Away' },
  { id: 'u5', username: 'NeonSpecter', pfpUrl: null, status: 'Offline' },
]

export function FriendsPage() {
  const { user } = useAuthStore()
  const { friends, messages, addFriend, sendMessage } = useFriendsStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  const filteredDiscover = DISCOVER_USERS.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !friends.some(f => f.id === u.id)
  )

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, selectedFriend])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !selectedFriend || !user) return
    sendMessage(user.id, selectedFriend.id, chatInput.trim())
    setChatInput('')
  }

  const currentChatMessages = messages.filter(m => 
    (m.senderId === user?.id && m.receiverId === selectedFriend?.id) ||
    (m.senderId === selectedFriend?.id && m.receiverId === user?.id)
  )

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
              {filteredDiscover.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#773877] flex items-center justify-center border border-white/10">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-medium text-sm">{u.username}</span>
                  </div>
                  <button 
                    onClick={() => addFriend(u)}
                    className="p-2 rounded-lg bg-white/10 text-white hover:bg-[#773877] transition-all"
                    title="Add Friend"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {filteredDiscover.length === 0 && (
                <p className="text-center py-4 text-white/20 text-sm">No users found</p>
              )}
            </div>
          </div>

          <div className="bg-[#42135b] rounded-2xl p-6 shadow-xl border border-white/5 flex-1 min-h-[400px]">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
              Your Friends
            </h2>
            <div className="flex flex-col gap-2">
              {friends.map(f => (
                <div 
                  key={f.id} 
                  onClick={() => setSelectedFriend(f)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    selectedFriend?.id === f.id ? 'bg-[#773877] shadow-lg' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-[#331442] flex items-center justify-center border border-white/10">
                        <User className="w-5 h-5 text-white" />
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
                  {selectedFriend?.id === f.id && (
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
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
                      <User className="w-12 h-12 text-white" />
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
                    className="px-6 py-3 bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 rounded-xl font-bold transition-all border border-white/5"
                    onClick={() => { /* Remove friend logic could go here */ }}
                  >
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
                    {currentChatMessages.map(m => (
                      <div 
                        key={m.id} 
                        className={`flex flex-col ${m.senderId === user.id ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`max-w-[70%] p-3 px-4 rounded-2xl text-sm font-roboto shadow-lg ${
                          m.senderId === user.id 
                            ? 'bg-[#773877] text-white rounded-tr-none' 
                            : 'bg-white/10 text-white rounded-tl-none border border-white/5'
                        }`}>
                          {m.content}
                        </div>
                        <span className="text-[10px] text-white/20 mt-1 uppercase font-bold">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                    {currentChatMessages.length === 0 && (
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

      <Footer />
    </div>
  )
}
