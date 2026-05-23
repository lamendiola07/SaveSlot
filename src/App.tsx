import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { StartupPage } from './pages/StartupPage'
import { AuthPage } from './pages/AuthPage'
import { GameDetailPage } from './pages/GameDetailPage'
import { GamesPage } from './pages/GamesPage'
import { supabase } from './services/supabase'
import { useAuthStore } from './store'

export default function App() {
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [setUser])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartupPage />} />
        <Route path="/auth" element={<AuthPage onClose={() => window.history.back()} />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/upcoming" element={<GamesPage forceType="upcoming" />} />
        <Route path="/popular" element={<GamesPage forceType="popular" />} />
        <Route path="/game/:id" element={<GameDetailPage />} />
      </Routes>
    </Router>
  )
}
