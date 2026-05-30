import { useState } from 'react'
import { X, AlertTriangle, ShieldAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, useReportsStore } from '../store'

interface Props {
  targetId: string
  targetType: 'post' | 'comment'
  onClose: () => void
}

const OFFENSES = [
  'Verbal Abuse',
  'Spam',
  'Inappropriate Content',
  'Harassment',
  'Hate Speech',
  'Misinformation',
  'Other'
]

export function ReportModal({ targetId, targetType, onClose }: Props) {
  const { user } = useAuthStore()
  const { addReport } = useReportsStore()
  const [selectedOffenses, setSelectedOffenses] = useState<string[]>([])
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubscribed] = useState(false)

  const toggleOffense = (offense: string) => {
    setSelectedOffenses(prev => 
      prev.includes(offense) 
        ? prev.filter(o => o !== offense) 
        : [...prev, offense]
    )
  }

  const handleSubmit = async () => {
    if (selectedOffenses.length === 0 || !user) return
    setSubmitting(true)
    
    addReport({
      reporterId: user.id,
      targetId,
      targetType,
      offense: selectedOffenses.join(', '),
      details: selectedOffenses.includes('Other') ? details : undefined
    })

    setTimeout(() => {
      setSubmitting(false)
      setSubscribed(true)
      setTimeout(onClose, 2000)
    }, 800)
  }

  const showOther = selectedOffenses.includes('Other')

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-[#2a0838] border border-white/10 rounded-2xl w-[480px] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2 text-red-400">
            <ShieldAlert className="w-5 h-5" />
            <h2 className="font-roboto font-bold text-white text-2xl uppercase tracking-tight">Report {targetType}</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-5"
              >
                <p className="font-roboto text-white/60 text-sm leading-relaxed">
                  Help us understand what's happening. Select all that apply for this {targetType}:
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {OFFENSES.map(offense => {
                    const isSelected = selectedOffenses.includes(offense)
                    return (
                      <button
                        key={offense}
                        onClick={() => toggleOffense(offense)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-roboto text-left ${
                          isSelected 
                            ? 'bg-[#773877]/20 border-[#773877] text-white shadow-lg' 
                            : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'bg-[#773877] border-[#773877]' : 'border-white/20'
                        }`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                        </div>
                        {offense}
                      </button>
                    )
                  })}
                </div>

                {showOther && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="overflow-hidden"
                  >
                    <p className="text-[13px] text-white/40 font-roboto uppercase tracking-wider mb-2 ml-1">Additional details</p>
                    <textarea
                      placeholder="Please provide more details..."
                      value={details}
                      onChange={e => setDetails(e.target.value)}
                      className="w-full h-20 bg-white/5 border border-white/10 rounded-md p-3 text-white text-sm font-roboto outline-none focus:border-[#773877] resize-none"
                      rows={3}
                    />
                  </motion.div>
                )}

                <div className="flex gap-5 mt-2">
                  <button 
                    onClick={onClose}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 font-roboto font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={selectedOffenses.length === 0 || submitting}
                    className="flex-[2] px-3 py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-30 disabled:grayscale text-white font-roboto font-bold transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Submit Report'
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-10 text-center gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    className="text-green-500"
                  >
                    <AlertTriangle className="w-8 h-8" />
                  </motion.div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl mb-1">Report Received</h3>
                  <p className="text-white/40 text-sm">Thank you for helping keep SaveSlot safe.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
