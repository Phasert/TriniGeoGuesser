'use client'

import { useEffect, useState } from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { LocationData } from '@/lib/type'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/useAuthStore'

type Difficulty = 'easy' | 'medium' | 'hard'

const containerStyle = {
  width: '100%',
  height: '400px',
}

const defaultCenter = { lat: 10.6, lng: -61.4 }

export default function GamePage() {
  const [mode, setMode] = useState<Difficulty | null>(null)
  const [location, setLocation] = useState<LocationData | null>(null)
  const [userGuess, setUserGuess] = useState<{ lat: number; lng: number } | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [distance, setDistance] = useState<number | null>(null)
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [mapKey, setMapKey] = useState(0)
  const [score, setScore] = useState(0)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [scoreSaved, setScoreSaved] = useState(false)
  const [shownLocationIds, setShownLocationIds] = useState<string[]>([])
  const [gameStats, setGameStats] = useState({
    correct: 0,
    wrong: 0,
    skipped: 0
  })

  const [timeLeft, setTimeLeft] = useState(60)
  const [timerStarted, setTimerStarted] = useState(false)
  const router = useRouter()
  const { user } = useAuthStore()

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  })

  
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
      } else if (!user.emailVerified) {
        alert('You need to verify your email first')
        router.push('/verify-email')
      }
    }
  }, [user, router, isAuthReady])

  const fetchLocation = async () => {
    if (!mode) return
    
    let newLocation = null;
    let attempts = 0;
    const maxAttempts = 5; 
    
    while (!newLocation && attempts < maxAttempts) {
      attempts++;
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'fetch', 
          mode,
          exclude: shownLocationIds 
        }),
      })
      
      const data = await res.json()
      
    
      if (data.location && !shownLocationIds.includes(data.location.id)) {
        newLocation = data.location;
       
        setShownLocationIds(prev => [...prev, data.location.id]);
      }
    }
    
    if (newLocation) {
      setLocation(newLocation);
      setUserGuess(null);
      setConfirmed(false);
      setRevealed(false);
      setShowHint(false);
      setDistance(null);
      setMapCenter(defaultCenter);
      setMapKey((k) => k + 1);
    }
  }

  useEffect(() => {
    
    if (mode && user) {
      fetchLocation()
      setTimeLeft(300)
      setTimerStarted(true)
    }
  }, [mode, user])

  useEffect(() => {
    if (!timerStarted || timeLeft <= 0) return
    
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t === 1) {
          handleGameOver()
          return 0
        }
        return t - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [timerStarted, timeLeft])

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!confirmed && e.latLng) {
      setUserGuess({ lat: e.latLng.lat(), lng: e.latLng.lng() })
    }
  }

  const handleConfirmGuess = async () => {
    if (userGuess && location && mode) {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'distance',
          guess: userGuess,
          actual: location.coordinates,
        }),
      })
  
      const data = await res.json()
      const dist = data.distance
      setDistance(dist)
      setConfirmed(true)
      setRevealed(true)
  
      const earnedPoint =
        (mode === 'easy' && dist <= 5) ||
        (mode === 'medium' && dist <= 2.5) ||
        (mode === 'hard' && dist <= 1)
  
      if (earnedPoint) {
        setScore((prev) => prev + 1)
        setGameStats(prev => ({...prev, correct: prev.correct + 1}))
      } else {
        setGameStats(prev => ({...prev, wrong: prev.wrong + 1}))
      }
    }
  }
  
  const handleSkip = () => {
    setGameStats(prev => ({...prev, skipped: prev.skipped + 1}))
    fetchLocation()
  }

  const renderTimer = () => {
    const radius = 40
    const circumference = 2 * Math.PI * radius
    const progress = (300 - timeLeft) / 300 * circumference
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60

    return (
        
      <div className="absolute top-4 right-4 z-50">
        <svg width="100" height="100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#d1d5db"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#10b981"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
          <text
            x="50"
            y="55"
            textAnchor="middle"
            fontSize="20"
            fill="#111827"
            fontWeight="bold"
          >
            {`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`}
          </text>
        </svg>
      </div>
      
    )
  }

  const handleExitClick = () => {
    setShowExitModal(true)
  }

  const handleConfirmExit = (selectedMode?: Difficulty) => {
    if (selectedMode) {
      router.push(`/leaderboard?mode=${selectedMode}`)
    } else {
      router.push('/leaderboard')
    }
  }

  const handleCancelExit = () => {
    setShowExitModal(false)
  }

  const handleGameOver = async () => {
    if (gameOver) return;
    
    setGameOver(true)
    
    if (mode && user && !scoreSaved) {
      try {
        const res = await fetch('/api/game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'saveScore',
            mode,
            score,
            username: user.username || 'Anonymous'
          }),
        })
        
        if (res.ok) {
          setScoreSaved(true)
          console.log('Score saved successfully')
        }
      } catch (error) {
        console.error('Error saving score:', error)
      }
    }
  }

  if (!isAuthReady || !isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen mx-auto relative">
     
      
      {!mode ? (
        <div className="min-h-screen w-screen bg-[url('/images/game/mode_bg.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center text-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold text-white drop-shadow">Choose Yuh Mode</h1>
            <div className="flex gap-6 flex-wrap justify-center">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-8 py-4 text-lg rounded-full font-bold text-white shadow-md transition-all duration-300 transform hover:scale-110 hover:shadow-2xl ${
                    m === 'easy'
                      ? 'bg-green-500 hover:bg-green-600'
                      : m === 'medium'
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)} Mode
                </button>
              ))}
            </div>
            <a 
              href="/leaderboard" 
              className="mt-6 inline-block text-white text-lg font-semibold hover:underline p-2 bg-black hover:bg-red-500 hover:text-white rounded-lg"
            >
              ← Back to Leaderboard
            </a>
            
          </div>
        </div>
      ) : gameOver ? (
        <div className="min-h-screen bg-[url('/images/game/end_bg.png')] bg-cover bg-center bg-no-repeat  flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
            <h2 className="text-3xl font-bold text-red-600 mb-4">Time&apos;s Up!</h2>
            <p className="text-xl mb-2">Your final score: <span className="font-bold text-2xl">{score}</span></p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Game Stats:</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-green-100 p-2 rounded">
                  <span className="block text-green-700 font-bold text-xl">{gameStats.correct}</span>
                  <span className="text-sm text-green-600">Correct</span>
                </div>
                <div className="bg-red-100 p-2 rounded">
                  <span className="block text-red-700 font-bold text-xl">{gameStats.wrong}</span>
                  <span className="text-sm text-red-600">Wrong</span>
                </div>
                <div className="bg-gray-200 p-2 rounded">
                  <span className="block text-gray-700 font-bold text-xl">{gameStats.skipped}</span>
                  <span className="text-sm text-gray-600">Skipped</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-row gap-4">
              <a 
                href="/leaderboard" 
                className="block w-1/2 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
              >
                View Leaderboard
              </a>
              <button
                onClick={() => {
                  setMode(null)
                  setGameOver(false)
                  setScore(0)
                  setScoreSaved(false)
                  setTimeLeft(300)
                  setShownLocationIds([])
                  setGameStats({correct: 0, wrong: 0, skipped: 0})
                }}
                className="py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 w-1/2"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      ) : location ? (
        <>
          {renderTimer()}
          <div className="absolute top-4 left-4 z-50">
            <div className="w-24 h-24 rounded-full bg-red-600 text-white flex flex-col items-center justify-center shadow-md">
              <span className="text-sm font-semibold">Score</span>
              <span className="text-2xl font-bold">{score}</span>
            </div>
          </div>
          <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-red-700 capitalize">{mode} Mode</h1>
            <p className="text-gray-700 mb-4">Guess where this place is in sweet T&T!</p>

            <div className="flex flex-col md:flex-row gap-6 justify-center items-start">
              <div className="w-full md:w-1/2 rounded-xl overflow-hidden shadow-md">
                <img
                  src={location.imageUrl}
                  alt="Clue"
                  className="w-full h-[300px] object-cover rounded-xl"
                />
              </div>

              {revealed && (
                <div className="w-full md:w-1/2 bg-white border rounded-xl p-6 shadow space-y-4">
                  <h2 className="text-2xl font-bold text-red-700">{location.name}</h2>
                  <p className="text-gray-800">{location.info}</p>
                  <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                    <span>🧭</span> Distance from guess: {distance?.toFixed(2)} km
                  </p>
                </div>
              )}
            </div>

            {mode === 'easy' && location.hint && !revealed && (
              <div className="text-center mt-4">
                {!showHint ? (
                  <button
                    onClick={() => setShowHint(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md font-semibold transition"
                  >
                    Show Hint 🧠
                  </button>
                ) : (
                  <p className="text-green-600 italic">Hint: {location.hint}</p>
                )}
              </div>
            )}

            <div className="rounded-lg overflow-hidden border shadow">
              <GoogleMap
                key={mapKey}
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={9}
                onClick={handleMapClick}
              >
                {userGuess && <Marker position={userGuess} label="You" />}
                {revealed && <Marker position={location.coordinates} label="Correct" />}
              </GoogleMap>
            </div>

            <div className="flex justify-center gap-4 mt-4 flex-wrap">
              {!confirmed && userGuess && (
                <button
                  onClick={handleConfirmGuess}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
                >
                  Confirm Guess
                </button>
              )}
              <button
                onClick={handleSkip}
                className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-3 rounded-lg font-semibold"
              >
                Skip
              </button>
              <button
                onClick={handleExitClick}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Exit
              </button>
              {revealed && (
                <button
                  onClick={fetchLocation}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <div>Loading location...</div>
      )}

      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-3 text-red-600">Are you sure you want to leave?</h3>
            <p className="mb-6 text-gray-700">Your progress will not be saved.</p>
            
            <div className="flex flex-row gap-3 mb-4">
              <button
                onClick={() => handleConfirmExit()}
                className="w-1/2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Confirm Leaving
              </button>
              <button
                onClick={handleCancelExit}
                className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
