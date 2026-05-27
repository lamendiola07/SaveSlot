import { User } from 'lucide-react'

const friends = [
  { name: 'Jason Bueller', handle: '@jasonb', isYou: true, status: 'Online' },
  { name: 'Cyrus Storm', handle: '@stormcy', status: 'Online' },
  { name: 'Lyric Frost', handle: '@frostlyric', status: 'Offline' },
  { name: 'Zara Blaze', handle: '@zarablaze', status: 'In-game' },
  { name: 'Jaxon Ember', handle: '@jaxonember', status: 'Online' },
  { name: 'Sable Rune', handle: '@sablerune', status: 'Offline' },
  { name: 'Orion Valor', handle: '@orionvalor', status: 'Away' },
]

export function Sidebar() {
  return (
    <div className="flex flex-col overflow-hidden h-[544px] w-[381px] rounded-2xl shadow-2xl">
      {/* Friend List */}
      <div className="flex flex-col gap-2 py-6 bg-[#42135b] flex-1">
        <p className="font-roboto font-bold text-xl text-white leading-6 px-6 uppercase tracking-wider">
          Friend List
        </p>
        <div className="flex flex-col mt-4">
          {friends.map((player) => (
            <div key={player.handle} className="flex items-center justify-between py-3 px-6 hover:bg-white/5 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#773877] border border-white/20 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-white transition-all">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col font-roboto text-[13px] min-w-0">
                  <span className="text-white font-semibold leading-5 overflow-hidden text-ellipsis whitespace-nowrap">{player.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      player.status === 'Online' ? 'bg-green-400' : 
                      player.status === 'In-game' ? 'bg-blue-400' : 
                      player.status === 'Away' ? 'bg-yellow-400' : 'bg-white/20'
                    }`} />
                    <span className="text-white/50 leading-4 overflow-hidden text-ellipsis whitespace-nowrap text-[11px]">{player.status}</span>
                  </div>
                </div>
              </div>
              {!player.isYou && (
                <button className="bg-white/10 text-white hover:bg-white/20 font-roboto font-medium text-[12px] px-3 py-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                  Chat
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
