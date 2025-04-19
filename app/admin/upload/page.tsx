'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { LocationData } from '@/lib/type'

export default function UploadLocationPage() {
  const [name, setName] = useState('')
  const [info, setInfo] = useState('')
  const [hint, setHint] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [difficulty, setDifficulty] = useState('easy')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState('')
  const [preview, setPreview] = useState<LocationData | null>(null)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const { user, isUserAdmin } = useAuthStore()
  const router = useRouter()

 
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAuthReady(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isAuthReady) {
      if (!user) {
        alert('You need to login to access this page')
        router.push('/login')
      } else if (!isUserAdmin()) {
        alert('You do not have permission to access this page')
        router.push('/leaderboard')
      }
    }
  }, [user, router, isAuthReady, isUserAdmin])

  const handleUpload = async () => {
    setStatus('Uploading...')

    if (!name || !info || !lat || !lng || !imageUrl) {
      setStatus('Missing required fields')
      return
    }

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, info, hint, lat, lng, imageUrl, difficulty }),
      })

      const result = await res.json()

      if (!res.ok) {
        setStatus('❌ Upload failed: ' + result.error)
        return
      }

      setStatus('✅ Uploaded successfully!')
      setPreview(result.data)

  
      setName('')
      setHint('')
      setInfo('')
      setLat('')
      setLng('')
      setImageUrl('')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setStatus('❌ Upload failed: ' + err.message)
      } else {
        setStatus('❌ Upload failed: Unknown error occurred')
      }
    }
  }

  if (!isAuthReady || !user || !isUserAdmin()) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="min-h-screen bg-white flex flex-col md:flex-row items-start justify-center gap-8 p-6">
        <div className={`w-full ${preview ? 'md:w-1/2' : 'md:w-full'} bg-red-50 p-6 rounded-xl shadow-xl transition-all duration-300`}>
          <h1 className="text-xl font-bold text-red-600 mb-4">📍 Upload New Location</h1>

          <div className="grid grid-cols-1 gap-4">
            <input className="input" placeholder="Location Name" value={name} onChange={(e) => setName(e.target.value)} />
            <textarea className="input" placeholder="Location Info" value={info} onChange={(e) => setInfo(e.target.value)} />
            {difficulty === 'easy' && (
              <input className="input" placeholder="Hint (Only for Easy)" value={hint} onChange={(e) => setHint(e.target.value)} />
            )}
            <div className="flex gap-4">
              <input className="input w-full" type="number" placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
              <input className="input w-full" type="number" placeholder="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} />
            </div>
            <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <input className="input" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            <button
              onClick={handleUpload}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold"
            >
              Upload Location
            </button>
          </div>

          <p className="text-sm mt-4 text-gray-700">{status}</p>
        </div>

      
        {preview && (
          <div className="w-full md:w-1/2 bg-white border rounded-xl shadow-xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 h-64 md:h-auto">
                <img src={preview.imageUrl} alt={preview.name} className="w-full h-full object-cover" />
              </div>
              <div className="w-full md:w-1/2 p-4 space-y-2">
                <h2 className="text-xl font-bold text-red-700">{preview.name}</h2>
                <p className="text-gray-700 text-sm">{preview.info}</p>
                {preview.hint && (
                  <p className="text-sm text-green-600 italic">Hint: {preview.hint}</p>
                )}
                <p className="text-xs text-gray-500">Lat: {preview.coordinates.lat}</p>
                <p className="text-xs text-gray-500">Lng: {preview.coordinates.lng}</p>
              </div>
            </div>

            <div className="w-full h-100">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  `${preview.coordinates.lat},${preview.coordinates.lng}`
                )}&z=14&output=embed`}
                width="100%"
                height="100%"
                className="border-0"
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .input {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 0.5rem;
          width: 100%;
        }
      `}</style>
    </div>
  )
}
