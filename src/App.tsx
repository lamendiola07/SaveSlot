import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { StartupPage } from './pages/StartupPage'
import { AuthPage } from './pages/AuthPage'
import { GameDetailPage } from './pages/GameDetailPage'
import { GamesPage } from './pages/GamesPage'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartupPage />} />
        <Route path="/auth" element={<AuthPage onClose={() => window.history.back()} />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/game/:id" element={<GameDetailPage />} />
      </Routes>
    </Router>
  )
}
