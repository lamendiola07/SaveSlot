const footerLinks = [
  'Privacy Policy', 'Terms of Service', 'Contact Us', 'About Us',
  'Careers', 'Press', 'Developers', 'Advertise', 'Help',
]

export function Footer() {
  return (
    <footer className="w-full bg-[#45413e]">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-12 py-5">
        {footerLinks.map((link) => (
          <button key={link} className="font-roboto text-[12px] text-white/40 hover:text-white/60 leading-4 whitespace-nowrap transition-colors">
            {link}
          </button>
        ))}
      </div>
    </footer>
  )
}
