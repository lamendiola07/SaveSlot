import { useState } from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { Sidebar } from '../components/Sidebar'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../services/supabase'
import { ALL_GAMES } from '../data/games'

const imgMcBg = 'https://www.figma.com/api/mcp/asset/22658344-f632-4b41-ab45-55187c980834'
const imgImageFile = 'https://www.figma.com/api/mcp/asset/aa890ee0-d73e-4427-9ed7-e34839008ab8'
const imgArrowRight = 'https://www.figma.com/api/mcp/asset/6e8a0c26-cf21-4ea5-8b28-c87b57815d38'
const imgChevronRight = 'https://www.figma.com/api/mcp/asset/58d0fb28-93b9-48e1-8294-24a54697d2fd'

import { GameCard } from '../components/GameCard'

const upcomingGames = ALL_GAMES.slice(0, 4)

function AuthModal({ onClose }: { onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(false)
  const [formData, setFormData] = useState({ email: '', username: '', password: '', accept: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        if (error) throw error
      } else {
        if (!formData.accept) {
          throw new Error('Please accept the privacy policy')
        }
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
            },
          },
        })
        if (error) throw error
        alert('Check your email for the confirmation link!')
      }
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(4,4,4,0.6)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative rounded-[20px] bg-[#42135b] overflow-hidden shadow-2xl flex flex-col items-center p-8 border border-white/10"
        style={{ width: 500, minHeight: 600 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-roboto font-bold text-white text-[28px] text-center mb-6 uppercase">
          {isLogin ? 'WELCOME BACK' : 'BE PART OF SAVESLOT'}
        </h2>

        {error && (
          <div className="w-full bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg mb-4 text-sm font-roboto">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full max-w-[400px] flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-roboto text-white/80 text-base">Email Address</label>
            <input 
              type="email" 
              required
              disabled={loading}
              className="w-full h-12 bg-[#d9d9d9] rounded-[10px] px-4 font-roboto text-black outline-none focus:ring-2 ring-white/50 disabled:opacity-50"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label className="font-roboto text-white/80 text-base">Username</label>
              <input 
                type="text" 
                required
                disabled={loading}
                className="w-full h-12 bg-[#d9d9d9] rounded-[10px] px-4 font-roboto text-black outline-none focus:ring-2 ring-white/50 disabled:opacity-50"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="font-roboto text-white/80 text-base">Password</label>
            <input 
              type="password" 
              required
              disabled={loading}
              className="w-full h-12 bg-[#d9d9d9] rounded-[10px] px-4 font-roboto text-black outline-none focus:ring-2 ring-white/50 disabled:opacity-50"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {!isLogin && (
            <div className="flex gap-3 items-start mt-1">
              <input 
                type="checkbox" 
                required
                id="accept"
                disabled={loading}
                className="w-5 h-5 shrink-0 mt-1 cursor-pointer accent-white"
                checked={formData.accept}
                onChange={(e) => setFormData({...formData, accept: e.target.checked})}
              />
              <label htmlFor="accept" className="font-roboto text-white/70 text-xs leading-snug cursor-pointer select-none">
                I accept the Privacy Policy and consent to the processing of my personal information in accordance with it.
              </label>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-white/90 transition-colors rounded-[10px] h-12 mt-4 flex items-center justify-center group disabled:opacity-50"
          >
            <span className="font-roboto font-bold text-black text-[18px]">
              {loading ? 'PROCESSING...' : (isLogin ? 'SIGN IN' : 'SIGN UP')}
            </span>
          </button>

          <p className="text-white/60 text-center font-roboto text-sm mt-4">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              disabled={loading}
              onClick={() => setIsLogin(!isLogin)}
              className="text-white hover:underline font-bold"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </form>

        <button 
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors disabled:hidden"
        >
          ✕
        </button>
      </motion.div>
    </div>
  )
}

export function AuthPage({ onClose }: { onClose: () => void }) {
  return (
    <div className="min-w-[1440px] relative">
      {/* ── Hero Section ── */}
      <section className="relative h-[810px] overflow-hidden">
        <img
          src={imgMcBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none"
        />
        <Header />

        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 392, width: 875 }}>
          <div className="text-white font-roboto text-[48px] text-center leading-[60px] drop-shadow-lg">
            <p>Track the games you've played.</p>
            <p>Save the one's you want.</p>
            <p>Share your experience with friends.</p>
          </div>
        </div>

        <div className="absolute" style={{ left: 527, top: 610, width: 300 }}>
          <button className="w-full h-14 bg-[#45413e] rounded-[10px] font-roboto text-white text-2xl leading-[60px] text-center shadow-xl">
            Get started - it's free!
          </button>
        </div>

        <div className="absolute right-[508px] font-roboto text-[#45413e] text-xl text-right whitespace-nowrap bg-white/10 px-4 py-1 rounded backdrop-blur-sm"
          style={{ top: 708 }}>
          The social hub for gamers. Play, Share, and Discover.
        </div>

        <div className="absolute right-8 flex items-center justify-center" style={{ top: 313, height: 185, width: 20 }}>
          <p className="-rotate-90 font-roboto text-white text-xl opacity-60 whitespace-pre origin-center">
            {'MINECRAFT  1.26.1'}
          </p>
        </div>
      </section>

      {/* ── Upcoming Games ── */}
      <section className="mx-auto px-[120px] pb-12" style={{ maxWidth: 1440 }}>
        <div className="flex items-baseline justify-between py-6">
          <p className="font-roboto text-xl text-black/80 whitespace-nowrap">UPCOMING GAMES</p>
          <button className="flex items-center gap-1 font-roboto font-medium text-[15px] text-black/80 hover:underline">
            See all
            <img src={imgArrowRight} alt="" className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-6">
          {upcomingGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
        <div className="mt-16 flex justify-end gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} className={`w-9 h-9 rounded flex items-center justify-center font-roboto font-medium text-[15px] ${n === 1 ? 'bg-black/80 text-white' : 'text-black/40 hover:bg-black/10'}`}>
              {n}
            </button>
          ))}
          <button className="w-9 h-9 rounded bg-white flex items-center justify-center hover:bg-gray-100">
            <img src={imgChevronRight} alt="Next" className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ── What You Can Do ── */}
      <section className="mx-auto px-10 py-12" style={{ maxWidth: 1440 }}>
        <h2 className="font-roboto text-[#45413e] text-[32px] text-center mb-16">
          WHAT YOU CAN DO WITH SAVESLOT.
        </h2>
        <div className="flex items-end justify-center gap-4">
          {[
            { w: 269, h: 331 }, { w: 310, h: 381 }, { w: 346, h: 417 },
            { w: 310, h: 381 }, { w: 269, h: 331 },
          ].map((card, i) => (
            <div key={i} className="bg-[#d9d9d9] rounded-[15px] shadow-lg shrink-0 hover:scale-105 transition-transform"
              style={{ width: card.w, height: card.h }} />
          ))}
        </div>
      </section>

      {/* ── Popular Games + Sidebar ── */}
      <section className="mx-auto px-10 py-12 flex gap-8" style={{ maxWidth: 1440 }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between py-6 border-b border-black/20">
            <p className="font-roboto text-xl text-black/80">THIS WEEK'S POPULAR GAMES</p>
            <button className="font-roboto font-medium text-[15px] text-black/80 hover:underline">MORE</button>
          </div>
          {[0, 1].map((row) => (
            <div key={row} className="flex items-start gap-6 py-6 border-b border-black/20 group cursor-pointer">
              <div className="bg-[#eee] border-2 border-black/80 rounded overflow-hidden shrink-0 flex items-center justify-center group-hover:border-black transition-colors"
                style={{ width: 235, height: 272 }}>
                <img src={imgImageFile} alt="" className="w-16 h-16" />
              </div>
              <div className="flex flex-col gap-2 flex-1 min-w-0 pt-2">
                <p className="font-roboto font-medium text-[32px] text-black/80 overflow-hidden text-ellipsis whitespace-nowrap group-hover:text-black">
                  Game Title
                </p>
                <p className="font-roboto font-medium text-[15px] text-black/80 group-hover:text-black/60">
                  Add ratings & description here
                </p>
              </div>
            </div>
          ))}
        </div>
        <Sidebar />
      </section>

      <div className="border-t border-black/20" />
      <Footer />

      {/* ── Auth Modal ── */}
      <AuthModal onClose={onClose} />
    </div>
  )
}
