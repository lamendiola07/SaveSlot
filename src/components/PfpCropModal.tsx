import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { X, User } from 'lucide-react'

interface Props {
  onClose: () => void
  onSave: (croppedUrl: string) => void
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', reject)
    img.src = imageSrc
  })
  const size = Math.min(pixelCrop.width, pixelCrop.height)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
  ctx.clip()
  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, size, size,
  )
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(URL.createObjectURL(blob!)), 'image/jpeg', 0.92)
  })
}

export function PfpCropModal({ onClose, onSave }: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
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
    const url = await getCroppedImg(imageSrc, croppedAreaPixels)
    onSave(url)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#2a0838] border border-white/10 rounded-2xl w-[460px] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="font-roboto font-semibold text-white text-base">Edit Profile Picture</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!imageSrc ? (
          /* Upload prompt */
          <div className="p-10 flex flex-col items-center gap-5">
            <div className="w-28 h-28 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
              <User className="w-12 h-12 text-white/20" />
            </div>
            <p className="font-roboto text-sm text-white/40 text-center">
              Upload a photo to use as your profile picture.
            </p>
            <label className="cursor-pointer bg-[#773877] hover:bg-[#8f4a8f] text-white font-roboto font-medium text-sm px-7 py-2.5 rounded-lg transition-colors">
              Choose Photo
              <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
            </label>
          </div>
        ) : (
          <>
            {/* Cropper */}
            <div className="relative h-72 bg-black/60">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Controls */}
            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="font-roboto text-xs text-white/40 shrink-0 w-10">Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={e => setZoom(Number(e.target.value))}
                  className="flex-1 accent-[#773877] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="cursor-pointer font-roboto text-sm text-white/50 hover:text-white transition-colors">
                  Change Photo
                  <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-roboto text-sm rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2 bg-[#773877] hover:bg-[#8f4a8f] disabled:opacity-50 text-white font-roboto font-medium text-sm rounded-lg transition-colors"
                  >
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
