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
      <div className="flex flex-col gap-2 py-6 bg-[#9d9d9d] flex-1">
        <p className="font-shantell font-medium text-xl text-black/80 leading-6">
          Top Players
        </p>
        <div className="flex flex-col">
          {topPlayers.map((player) => (
            <div key={player.handle} className="flex items-center justify-between py-2 bg-[#9d9d9d]">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <img src={imgProfile} alt={player.name} className="w-10 h-10 shrink-0" />
                <div className="flex flex-col font-flow text-[13px] min-w-0 whitespace-nowrap overflow-hidden">
                  <span className="text-black/80 leading-5 overflow-hidden text-ellipsis">{player.name}</span>
                  <span className="text-black/40 leading-4 overflow-hidden text-ellipsis">{player.handle}</span>
                </div>
              </div>
              {!player.isYou && (
                <button className="bg-black/80 text-[#9d9d9d] font-shantell font-medium text-[15px] px-4 py-2 rounded shrink-0">
                  Follow
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fine print */}
      <div className="flex flex-wrap gap-x-4 gap-y-3 py-4 bg-[#9d9d9d]">
        {footerLinks.map((link) => (
          <button key={link} className="font-flow text-[13px] text-black/40 leading-4 whitespace-nowrap">
            {link}
          </button>
        ))}
      </div>
    </div>
  )
}
