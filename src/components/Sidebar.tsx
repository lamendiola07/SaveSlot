const imgProfile = 'https://www.figma.com/api/mcp/asset/94dcdcbc-e463-46e7-b8e5-47cbe2681898'

const topPlayers = [
  { name: 'Jason Bueller', handle: '@jasonb', isYou: true },
  { name: 'Cyrus Storm', handle: '@stormcy' },
  { name: 'Lyric Frost', handle: '@frostlyric' },
  { name: 'Zara Blaze', handle: '@zarablaze' },
  { name: 'Jaxon Ember', handle: '@jaxonember' },
  { name: 'Sable Rune', handle: '@sablerune' },
  { name: 'Orion Valor', handle: '@orionvalor' },
]

const footerLinks = [
  'Privacy Policy', 'Terms of Service', 'Contact Us', 'About Us',
  'Careers', 'Press', 'Developers', 'Advertise', 'Help',
]

export function Sidebar() {
  return (
    <div className="flex flex-col overflow-hidden h-[544px] w-[381px]">
      {/* Top Players */}
      <div className="flex flex-col gap-2 py-6 bg-[#42135b] flex-1">
        <p className="font-roboto font-medium text-xl text-white leading-6 px-4">
          Top Players
        </p>
        <div className="flex flex-col">
          {topPlayers.map((player) => (
            <div key={player.handle} className="flex items-center justify-between py-2 px-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <img src={imgProfile} alt={player.name} className="w-10 h-10 shrink-0" />
                <div className="flex flex-col font-roboto text-[13px] min-w-0 whitespace-nowrap overflow-hidden">
                  <span className="text-white/90 leading-5 overflow-hidden text-ellipsis">{player.name}</span>
                  <span className="text-white/50 leading-4 overflow-hidden text-ellipsis">{player.handle}</span>
                </div>
              </div>
              {!player.isYou && (
                <button className="bg-white/10 text-white hover:bg-white/20 font-roboto font-medium text-[13px] px-4 py-1.5 rounded transition-all">
                  Follow
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fine print */}
      <div className="flex flex-wrap gap-x-4 gap-y-3 py-6 px-4 bg-[#42135b]/50 border-t border-white/10">
        {footerLinks.map((link) => (
          <button key={link} className="font-roboto text-[12px] text-white/40 hover:text-white/60 leading-4 whitespace-nowrap transition-colors">
            {link}
          </button>
        ))}
      </div>
    </div>
  )
}
