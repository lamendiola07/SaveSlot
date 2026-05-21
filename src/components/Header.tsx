import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore, useSearchStore } from '../store'

const imgSearch = 'https://www.figma.com/api/mcp/asset/40eabe15-b606-4e1c-9e6a-08d2af1cbc06'
const imgBell = 'https://www.figma.com/api/mcp/asset/0166b32e-2102-42e3-ab0c-ce57824eeeb0'
const imgMessageComment = 'https://www.figma.com/api/mcp/asset/bc2c667c-faa3-4d00-9e97-3961532d2f9f'

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { query, setQuery } = useSearchStore()
  const navigate = useNavigate()

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
              setQuery(e.target.value)
              if (window.location.pathname !== '/games') navigate('/games')
            }}
            className="text-[15px] text-black w-full outline-none font-roboto placeholder:text-black/40"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="font-roboto text-[15px] text-white flex gap-6 shrink-0 h-full items-center">
        {!isAuthenticated ? (
          <>
            <Link to="/auth" className="h-10 px-2 flex items-center border-b-2 border-transparent hover:border-[#773877] hover:text-[#773877] transition-all">SIGN IN</Link>
            <Link to="/auth" className="h-10 px-2 flex items-center border-b-2 border-transparent hover:border-[#773877] hover:text-[#773877] transition-all">CREATE ACCOUNT</Link>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <span className="font-roboto uppercase">Hi, {user?.username}</span>
            <button onClick={logout} className="h-10 px-2 border-b-2 border-transparent hover:border-[#773877] hover:text-[#773877] transition-all">LOGOUT</button>
          </div>
        )}
        <Link to="/games" className={`h-10 px-2 flex items-center border-b-2 transition-all ${window.location.pathname === '/games' ? 'border-[#773877] text-[#773877]' : 'border-transparent hover:border-[#773877] hover:text-[#773877]'}`}>GAMES</Link>
        <Link to="#" className="h-10 px-2 flex items-center border-b-2 border-transparent hover:border-[#773877] hover:text-[#773877] transition-all">MEMBERS</Link>
        <Link to="#" className="h-10 px-2 flex items-center border-b-2 border-transparent hover:border-[#773877] hover:text-[#773877] transition-all">WHAT'S NEW?</Link>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-6 ml-auto shrink-0">
        <img src={imgBell} alt="notifications" className="w-6 h-6 cursor-pointer" />
        <button className="flex items-center gap-2 bg-white/80 rounded px-3 py-2 hover:bg-[#773877] transition-colors">
          <div className="relative w-5 h-5 overflow-visible">
            <img src={imgMessageComment} alt="" className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" />
          </div>
          <span className="font-roboto font-medium text-[#564242] text-[15px] whitespace-nowrap">
            New Post
          </span>
        </button>
      </div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 left-0 right-0 border-b border-white/100" />
    </header>
  )
}
