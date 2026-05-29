import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, User, Mail, Lock, LogOut, Pencil, UserRound, Search, Bell, MessageSquare, Users, ChevronDown } from 'lucide-react'
import { useAuthStore, useSearchStore } from '../store'
import { supabase } from '../services/supabase'
import { PfpCropModal } from './PfpCropModal'
import { NotificationsPanel } from './NotificationsPanel'
import { CreatePostModal } from './CreatePostModal'
import { motion, AnimatePresence } from 'framer-motion'

type ActivePanel = null | 'email' | 'password'

const GENRES = [
  { name: 'Action', slug: 'action' },
  { name: 'RPG', slug: 'role-playing-games-rpg' },
  { name: 'Strategy', slug: 'strategy' },
  { name: 'Shooter', slug: 'shooter' },
  { name: 'Adventure', slug: 'adventure' },
  { name: 'Indie', slug: 'indie' },
  { name: 'Casual', slug: 'casual' },
  { name: 'Simulation', slug: 'simulation' },
]

const YEARS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020']

const RATINGS = [
  { label: '90-100', value: '90,100' },
  { label: '80-89', value: '80,89' },
  { label: '70-79', value: '70,79' },
  { label: '60-69', value: '60,69' },
  { label: '50-59', value: '50,59' },
]

export function Header() {
  const { user, isAuthenticated } = useAuthStore()
  const { query, setQuery, setFilters, clearFilters } = useSearchStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [browseOpen, setBrowseOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)
  
  // Browse filter local state
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [selectedRating, setSelectedRating] = useState<string>('')

  const [emailInput, setEmailInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [showCropModal, setShowCropModal] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [showPostModal, setShowPostModal] = useState(false)
  const [pfpUrl, setPfpUrl] = useState<string | null>(() =>
    user?.id ? localStorage.getItem(`pfp_${user.id}`) : null
  )
  const menuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const browseRef = useRef<HTMLDivElement>(null)

  const username = user?.user_metadata?.username || user?.email?.split('@')[0]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setActivePanel(null)
        setFeedback('')
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false)
      }
      if (browseRef.current && !browseRef.current.contains(e.target as Node)) {
        setBrowseOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!user?.id) return
    supabase
      .from('profiles')
      .select('pfp_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.pfp_url) {
          setPfpUrl(data.pfp_url)
          localStorage.setItem(`pfp_${user.id}`, data.pfp_url)
        }
      })
  }, [user?.id])

  const handlePfpSave = async (url: string) => {
    setPfpUrl(url)
    if (user?.id) {
      localStorage.setItem(`pfp_${user.id}`, url)
      await supabase.from('profiles').update({ pfp_url: url }).eq('id', user.id)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
    navigate('/')
  }

  const handleUpdateEmail = async () => {
    if (!emailInput) return
    const { error } = await supabase.auth.updateUser({ email: emailInput })
    setFeedback(error ? error.message : 'Confirmation sent to new email.')
    if (!error) setEmailInput('')
  }

  const handleUpdatePassword = async () => {
    if (!passwordInput) return
    const { error } = await supabase.auth.updateUser({ password: passwordInput })
    setFeedback(error ? error.message : 'Password updated successfully.')
    if (!error) setPasswordInput('')
  }

  const togglePanel = (panel: ActivePanel) => {
    setActivePanel(prev => prev === panel ? null : panel)
    setFeedback('')
  }

  const handleGenreToggle = (slug: string) => {
    setSelectedGenres(prev => 
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    )
  }

  const handleBrowseSubmit = () => {
    const filters: any = {
      genres: selectedGenres.length > 0 ? selectedGenres.join(',') : undefined,
      dates: selectedYear ? `${selectedYear}-01-01,${selectedYear}-12-31` : undefined,
      metacritic: selectedRating || undefined,
      ordering: undefined // Reset ordering when browsing with new filters
    }
    setFilters(filters)
    setBrowseOpen(false)
    navigate('/games')
  }

  return (
    <header className="relative z-50" ref={browseRef}>
      <div className="relative flex items-center gap-16 px-12 py-3 bg-transparent">
        {/* Logo + Search */}
        <div className="flex items-center gap-8 shrink-0 w-[600px]">
          <Link to="/" className="block relative overflow-hidden shrink-0" style={{ width: 255, height: 38 }}>
            <img
              src="/SaveSlotLogo.png"
              alt="SaveSlot"
              className="absolute"
              style={{ width: 255, height: 300, top: -129, left: -48 }}
            />
          </Link>
          <div className="flex items-center gap-2 bg-white border-2 border-black/80 rounded px-3 w-[1000px] h-9">
            <Search className="w-10 h-5 text-black/40 shrink-0" />
            <input
              type="text"
              placeholder="Search games..."
              value={query}
              onChange={(e) => {
                clearFilters()
                setQuery(e.target.value)
                if (window.location.pathname !== '/games') navigate('/games')
              }}
              className="text-[15px] text-black w-full outline-none font-roboto placeholder:text-black/40"
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="font-roboto text-[15px] text-white flex gap-6 shrink-0 h-full items-center">
          {/* Browse Trigger */}
          <div className="h-10 flex items-center">
            <button 
              onClick={() => setBrowseOpen(!browseOpen)}
              className={`h-full px-2 flex items-center gap-1 border-b-2 transition-all ${browseOpen || window.location.pathname === '/games' ? 'border-[#773877] text-[#773877]' : 'border-transparent hover:border-[#773877] hover:text-[#773877]'}`}
            >
              BROWSE
              <ChevronDown className={`w-4 h-4 transition-transform ${browseOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <Link to="/upcoming" className={`h-10 px-2 flex items-center border-b-2 transition-all ${window.location.pathname === '/upcoming' ? 'border-[#773877] text-[#773877]' : 'border-transparent hover:border-[#773877] hover:text-[#773877]'}`}>WHAT'S NEW?</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4 ml-auto shrink-0 -mr-8">
          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotif(v => !v)}
              className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${showNotif ? 'bg-white/10' : 'hover:bg-white/10'}`}
              aria-label="Notifications"
            >
              <Bell className={`w-5 h-5 ${showNotif ? 'text-[#c77fc7]' : 'text-white'}`} />
            </button>
            {showNotif && <NotificationsPanel onClose={() => setShowNotif(false)} />}
          </div>

          <button
            onClick={() => setShowPostModal(true)}
            className="flex items-center gap-2 bg-white/80 rounded px-4 py-2 hover:bg-[#773877] hover:text-white transition-all group"
          >
            <MessageSquare className="w-5 h-5 text-[#564242] group-hover:text-white transition-colors" />
            <span className="font-roboto font-medium text-[#564242] group-hover:text-white text-[15px] whitespace-nowrap">New Post</span>
          </button>

          {/* Hamburger menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => { setMenuOpen(o => !o); setActivePanel(null); setFeedback('') }}
              className="flex items-center justify-center w-9 h-9 rounded hover:bg-white/10 transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>

            {menuOpen && (
              <div className="fixed top-[60px] right-3 w-72 bg-[#2a0838] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                {isAuthenticated ? (
                  <>
                    {/* Profile section */}
                    <div className="flex flex-col items-center px-4 pt-6 pb-5 border-b border-white/10 gap-3">
                      {/* PFP frame with edit overlay */}
                      <div className="relative group/pfp">
                        <div className="w-20 h-20 rounded-full bg-[#773877] border-2 border-white/20 flex items-center justify-center overflow-hidden">
                          {pfpUrl
                            ? <img src={pfpUrl} alt="Profile" className="w-full h-full object-cover" />
                            : <User className="w-9 h-9 text-white" />
                          }
                        </div>
                        <button
                          onClick={() => setShowCropModal(true)}
                          className="absolute inset-0 rounded-full bg-black/55 flex items-center justify-center opacity-0 group-hover/pfp:opacity-100 transition-opacity"
                          title="Edit profile picture"
                        >
                          <Pencil className="w-5 h-5 text-white" />
                        </button>
                      </div>
                      <span className="font-roboto text-white font-semibold text-base">Hi, {username}</span>
                    </div>

                    {/* Menu items */}
                    <div className="flex flex-col py-1">
                      {/* Profile link */}
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors group"
                      >
                        <UserRound className="w-4 h-4 shrink-0 text-[#c77fc7]" />
                        <span className="font-roboto text-white font-semibold text-sm truncate">{username}</span>
                      </Link>

                      {/* Find a friend */}
                      <Link
                        to="/friends"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors group"
                      >
                        <Users className="w-4 h-4 shrink-0 text-[#c77fc7]" />
                        <span className="font-roboto text-white font-semibold text-sm truncate">Find a friend</span>
                      </Link>

                      <div className="border-t border-white/10 mx-4 mb-1" />

                      {/* Edit Email */}
                      <button
                        onClick={() => togglePanel('email')}
                        className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-colors text-sm font-roboto"
                      >
                        <Mail className="w-4 h-4 shrink-0" />
                        Edit Email
                      </button>
                      {activePanel === 'email' && (
                        <div className="px-4 pb-3 flex flex-col gap-2">
                          <input
                            type="email"
                            placeholder="New email address"
                            value={emailInput}
                            onChange={e => setEmailInput(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded px-3 py-1.5 text-white text-xs font-roboto placeholder:text-white/30 outline-none focus:border-[#773877]"
                          />
                          <button
                            onClick={handleUpdateEmail}
                            className="w-full bg-[#773877] hover:bg-[#8f4a8f] text-white text-xs font-roboto font-medium py-1.5 rounded transition-colors"
                          >
                            Save Email
                          </button>
                        </div>
                      )}

                      {/* Change Password */}
                      <button
                        onClick={() => togglePanel('password')}
                        className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-colors text-sm font-roboto"
                      >
                        <Lock className="w-4 h-4 shrink-0" />
                        Change Password
                      </button>
                      {activePanel === 'password' && (
                        <div className="px-4 pb-3 flex flex-col gap-2">
                          <input
                            type="password"
                            placeholder="New password"
                            value={passwordInput}
                            onChange={e => setPasswordInput(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded px-3 py-1.5 text-white text-xs font-roboto placeholder:text-white/30 outline-none focus:border-[#773877]"
                          />
                          <button
                            onClick={handleUpdatePassword}
                            className="w-full bg-[#773877] hover:bg-[#8f4a8f] text-white text-xs font-roboto font-medium py-1.5 rounded transition-colors"
                          >
                            Save Password
                          </button>
                        </div>
                      )}

                      {feedback && (
                        <p className="px-4 pb-2 text-xs font-roboto text-white/60">{feedback}</p>
                      )}

                      <div className="border-t border-white/10 mt-1" />

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors text-sm font-roboto"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col p-2 gap-2">
                    <Link to="/auth" state={{ isLogin: true }} onClick={() => setMenuOpen(false)} className="w-full bg-[#773877] hover:bg-[#8f4a8f] text-white text-center font-roboto font-bold py-2.5 rounded-lg transition-colors shadow-lg">Sign In</Link>
                    <Link to="/auth" state={{ isLogin: false }} onClick={() => setMenuOpen(false)} className="w-full bg-white/10 hover:bg-white/20 text-white text-center font-roboto font-medium py-2.5 rounded-lg transition-colors">Create Account</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom divider */}
        <div className="absolute bottom-0 left-0 right-0 border-b border-white/100" />
      </div>

      {/* Extended Browse Panel */}
      <AnimatePresence>
        {browseOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 2 }}
            exit={{ height: 0, opacity: 0 }}
            className="absolute top-full left-12 right-12 bg-[#2a0838]/60 border border-white/10 border-t-0 rounded-b-2xl shadow-2xl overflow-hidden z-40"
          >
            <div className="p-5">
              <div className="flex gap-16">
                {/* Genres */}
                <div className="flex flex-col gap-4 flex-1">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">Filter by Genre</p>
                  <div className="grid grid-cols-4 gap-x-4 gap-y-3">
                    {GENRES.map(g => (
                      <label key={g.slug} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedGenres.includes(g.slug)}
                          onChange={() => handleGenreToggle(g.slug)}
                          className="hidden"
                        />
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${selectedGenres.includes(g.slug) ? 'bg-[#773877] border-[#773877] scale-110' : 'border-white/10 group-hover:border-white/30'}`}>
                          {selectedGenres.includes(g.slug) && <div className="w-2 h-2 bg-white rounded-sm shadow-sm" />}
                        </div>
                        <span className={`text-sm font-roboto transition-colors ${selectedGenres.includes(g.slug) ? 'text-white font-bold' : 'text-white/80 group-hover:text-white/80'}`}>{g.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Years */}
                <div className="flex flex-col gap-4 w-64">
                  <p className="text-white/80 text-xs font-bold uppercase tracking-[0.2em]">Release Year</p>
                  <div className="flex flex-wrap gap-2">
                    {YEARS.map(y => (
                      <button 
                        key={y}
                        onClick={() => setSelectedYear(selectedYear === y ? '' : y)}
                        className={`px-4 py-2 rounded-xl text-xs font-roboto transition-all border ${selectedYear === y ? 'bg-[#773877] border-[#773877] text-white font-bold shadow-lg scale-105' : 'border-white/10 text-white/80 hover:border-white/20 hover:text-white'}`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
                <button 
                  onClick={() => { setSelectedGenres([]); setSelectedYear(''); setSelectedRating('') }}
                  className="text-white/20 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Clear all filters
                </button>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setBrowseOpen(false)}
                    className="text-white/40 hover:text-white text-sm font-medium px-6 py-2 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleBrowseSubmit}
                    className="bg-[#773877] hover:bg-[#8f4a8f] text-white font-bold text-sm px-10 py-3 rounded-xl transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showCropModal && (
        <PfpCropModal onClose={() => setShowCropModal(false)} onSave={handlePfpSave} />
      )}

      {showPostModal && (
        <CreatePostModal onClose={() => setShowPostModal(false)} pfpUrl={pfpUrl} />
      )}
    </header>
  )
}

