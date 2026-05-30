import { Gamepad2 } from 'lucide-react'
import { motion } from 'framer-motion'

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[999] bg-[#240025] flex flex-col items-center justify-center">
      <div className="relative flex flex-col items-center">
        {/* Pulsing Gamepad Icon */}
        <motion.div
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.7, 1, 0.7],
            filter: [
              'drop-shadow(0 0 10px rgba(199,127,199,0.3))',
              'drop-shadow(0 0 25px rgba(199,127,199,0.8))',
              'drop-shadow(0 0 10px rgba(199,127,199,0.3))'
            ]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Gamepad2 className="w-24 h-24 text-[#c77fc7]" />
        </motion.div>

        {/* Loading Text & Bar */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <p className="font-roboto font-bold text-[#c77fc7] tracking-[0.4em] text-sm animate-pulse">
            LOADING SAVE DATA...
          </p>
          
          <div className="w-56 h-1.5 bg-[#42135b] rounded-full overflow-hidden shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#773877] to-[#c77fc7] rounded-full"
              initial={{ width: "0%", x: "-100%" }}
              animate={{ 
                width: ["0%", "50%", "100%", "100%"],
                x: ["0%", "0%", "0%", "100%"]
              }}
              transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
