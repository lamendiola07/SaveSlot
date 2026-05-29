import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { X, Image as ImageIcon } from 'lucide-react'

interface Props {
  onClose: () => void
  onSave: (croppedUrl: string) => Promise<void>
}

const MAX_OUTPUT_WIDTH = 1280

async function getCroppedCover(imageSrc: string, pixelCrop: Area): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', reject)
    img.src = imageSrc
  })

  const scale = Math.min(1, MAX_OUTPUT_WIDTH / pixelCrop.width)
  const outWidth = Math.round(pixelCrop.width * scale)
  const outHeight = Math.round(pixelCrop.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = outWidth
  canvas.height = outHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, outWidth, outHeight,
  )
  return canvas.toDataURL('image/jpeg', 0.82)
}

export function CoverCropModal({ onClose, onSave }: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    const reader = new FileReader()
    reader.onload = () => setImageSrc(reader.result as string)
    reader.readAsDataURL(file)
  }

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return
    setSaving(true)
    setError(null)
    try {
      const url = await getCroppedCover(imageSrc, croppedAreaPixels)
      await onSave(url)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4" onClick={saving ? undefined : onClose}>
      <div
        className="bg-[#2a0838] border border-white/10 rounded-2xl w-[640px] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="font-roboto font-semibold text-white text-base">Edit Cover Photo</h2>
          <button onClick={saving ? undefined : onClose} disabled={saving} className="text-white/40 hover:text-white transition-colors disabled:opacity-30">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!imageSrc ? (
          <div className="p-10 flex flex-col items-center gap-5">
            <div className="w-full h-28 rounded-xl bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-white/20" />
            </div>
            <p className="font-roboto text-sm text-white/40 text-center">
              Upload a photo to use as your cover image.
            </p>
            <label className="cursor-pointer bg-[#773877] hover:bg-[#8f4a8f] text-white font-roboto font-medium text-sm px-7 py-2.5 rounded-lg transition-colors">
              Choose Photo
              <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
            </label>
          </div>
        ) : (
          <>
            <div className="relative h-52 bg-black/60">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={16 / 5}
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="font-roboto text-xs text-white/40 shrink-0 w-10">Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  disabled={saving}
                  onChange={e => setZoom(Number(e.target.value))}
                  className="flex-1 accent-[#773877] cursor-pointer disabled:opacity-50"
                />
              </div>

              {error && (
                <p className="font-roboto text-xs text-red-400">{error}</p>
              )}

              <div className="flex items-center justify-between">
                <label className={`font-roboto text-sm transition-colors ${saving ? 'text-white/20 pointer-events-none' : 'cursor-pointer text-white/50 hover:text-white'}`}>
                  Change Photo
                  <input type="file" accept="image/*" disabled={saving} onChange={onFileChange} className="hidden" />
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    disabled={saving}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white font-roboto text-sm rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2 bg-[#773877] hover:bg-[#8f4a8f] disabled:opacity-60 text-white font-roboto font-medium text-sm rounded-lg transition-colors flex items-center gap-2"
                  >
                    {saving && (
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    )}
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
