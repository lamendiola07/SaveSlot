import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, User, Mail, Lock, LogOut, Pencil } from 'lucide-react'
import { useAuthStore, useSearchStore } from '../store'
import { supabase } from '../services/supabase'
import { PfpCropModal } from './PfpCropModal'

const imgSearch = 'https://www.figma.com/api/mcp/asset/40eabe15-b606-4e1c-9e6a-08d2af1cbc06'
const imgBell = 'https://www.figma.com/api/mcp/asset/0166b32e-2102-42e3-ab0c-ce57824eeeb0'
const imgMessageComment = 'https://www.figma.com/api/mcp/asset/bc2c667c-faa3-4d00-9e97-3961532d2f9f'

type ActivePanel = null | 'email' | 'password'

export function Header() {
  const { user, isAuthenticated } = useAuthStore()
  const { query, setQuery } = useSearchStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)
  const [emailInput, setEmailInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [showCropModal, setShowCropModal] = useState(false)
  const [pfpUrl, setPfpUrl] = useState<string | null>(() =>
    user?.id ? localStorage.getItem(`pfp_${user.id}`) : null
  )
  const menuRef = useRef<HTMLDivElement>(null)

  const username = user?.user_metadata?.username || user?.email?.split('@')[0]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setActivePanel(null)
        setFeedback('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handlePfpSave = (url: string) => {
    setPfpUrl(url)
    if (user?.id) localStorage.setItem(`pfp_${user.id}`, url)
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

  return (
    <header className="relative flex items-center gap-16 px-12 py-3 bg-transparent z-50">
      {/* Logo + Search */}
      <div className="flex items-center gap-8 shrink-0 w-[554px]">
        <Link to="/" className="font-roboto font-bold text-white text-2xl leading-none whitespace-nowrap">
          SaveSlot
        </Link>
        <div className="flex items-center gap-2 bg-white border-2 border-black/80 rounded px-2 w-[400px] h-9">
          <img src={imgSearch} alt="search" className="w-6 h-6 shrink-0" />
          <input
            type="text"
            placeholder="Search games..."
            value={query}
            onChange={(e) => {
              const { setFilters } = useSearchStore.getState()
              setFilters({ ordering: undefined, dates: undefined })
              setQuery(e.target.value)
              if (window.location.pathname !== '/games') navigate('/games')
            }}
            className="text-[15px] text-black w-full outline-none font-roboto placeholder:text-black/40"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="font-roboto text-[15px] text-white flex gap-6 shrink-0 h-full items-center">
        {!isAuthenticated && (
          <>
            <Link to="/auth" className="h-10 px-2 flex items-center border-b-2 border-transparent hover:border-[#773877] hover:text-[#773877] transition-all">SIGN IN</Link>
            <Link to="/auth" className="h-10 px-2 flex items-center border-b-2 border-transparent hover:border-[#773877] hover:text-[#773877] transition-all">CREATE ACCOUNT</Link>
          </>
        )}
        <Link to="/games" className={`h-10 px-2 flex items-center border-b-2 transition-all ${window.location.pathname === '/games' ? 'border-[#773877] text-[#773877]' : 'border-transparent hover:border-[#773877] hover:text-[#773877]'}`}>GAMES</Link>
        <Link to="#" className="h-10 px-2 flex items-center border-b-2 border-transparent hover:border-[#773877] hover:text-[#773877] transition-all">MEMBERS</Link>
        <Link to="#" className="h-10 px-2 flex items-center border-b-2 border-transparent hover:border-[#773877] hover:text-[#773877] transition-all">WHAT'S NEW?</Link>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-4 ml-auto shrink-0">
        <img src={imgBell} alt="notifications" className="w-6 h-6 cursor-pointer" />

        <button className="flex items-center gap-2 bg-white/80 rounded px-3 py-2 hover:bg-[#773877] transition-colors">
          <div className="relative w-5 h-5 overflow-visible">
            <img src={imgMessageComment} alt="" className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" />
          </div>
          <span className="font-roboto font-medium text-[#564242] text-[15px] whitespace-nowrap">New Post</span>
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
                <div className="flex flex-col py-1">
                  <Link to="/auth" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-colors text-sm font-roboto">Sign In</Link>
                  <Link to="/auth" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-colors text-sm font-roboto">Create Account</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 left-0 right-0 border-b border-white/100" />

      {showCropModal && (
        <PfpCropModal onClose={() => setShowCropModal(false)} onSave={handlePfpSave} />
      )}
    </header>
  )
}
