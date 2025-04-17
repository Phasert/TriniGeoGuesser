'use client'

import { useEffect, useState } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import { LogOut, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/useAuthStore'

type Difficulty = 'easy' | 'medium' | 'hard'

const leaderboardData = {
  easy: [
    { rank: 1, player: 'DoublesBoss', score: 520, best: 520 },
    { rank: 2, player: 'TriniTrivia', score: 480, best: 490 },
    { rank: 3, player: 'IslandLegend', score: 470, best: 470 },
  ],
  medium: [
    { rank: 1, player: 'SavannahSlicer', score: 610, best: 615 },
    { rank: 2, player: 'Socafairy', score: 590, best: 595 },
    { rank: 3, player: 'WinerKing', score: 570, best: 572 },
  ],
  hard: [
    { rank: 1, player: 'PanWarrior', score: 700, best: 710 },
    { rank: 2, player: 'ShadowMap', score: 680, best: 685 },
    { rank: 3, player: 'LimeMaster', score: 640, best: 640 },
  ],
}

const triniFacts = [
  'Maracas Bay is famous for bake & shark 🍞🦈',
  'Doubles is Trinidad\'s #1 breakfast 🌶',
  'The steelpan was invented in T&T 🥁',
  'Trinidad Carnival is the greatest show on earth 🎭',
  'We drive on the left but vibe on the right 🚗😎',
]



export default function LeaderboardPage() {
  const [selectedMode, setSelectedMode] = useState<Difficulty>('easy')
  const [showConfetti, setShowConfetti] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [factIndex, setFactIndex] = useState(0)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const { width, height } = useWindowSize()
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const leaderboard = leaderboardData[selectedMode]

  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAuthReady(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (err) {
      console.error('Error logging out:', err)
    }
  }
  

  useEffect(() => {
    setShowConfetti(true)
    setFactIndex(Math.floor(Math.random() * triniFacts.length))
    const timer = setTimeout(() => setShowConfetti(false), 4000)
    return () => clearTimeout(timer)
  }, [selectedMode])

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

  
  if (!isAuthReady) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[url('/images/bg.png')] bg-cover bg-fixed bg-center px-4 py-8 text-gray-800">
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={200} recycle={false} />}

  
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8 px-2 sm:px-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
            TG
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md">TriniGeo</h1>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden sm:flex items-center bg-black/30 rounded-md px-3 py-1.5 text-white">
              <span className="mr-1 font-medium">Welcome,</span>
              <span className="font-semibold">{user.username}</span>
            </div>
          )}
          <button 
           onClick={handleLogout}
          className="flex items-center gap-2 text-sm px-4 py-2 text-white bg-black/30 rounded-md hover:bg-black/50 transition">
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-xl border border-red-100 rounded-3xl shadow-xl p-6 sm:p-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-black text-red-700">🏆 Leaderboard</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
          >
            <Info className="w-4 h-4" /> View Full Leaderboard
          </button>
        </div>

   
        <div className="flex justify-center gap-3 mb-6">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode)}
              className={`text-white px-4 py-2 rounded-full text-sm font-semibold transition ${
                selectedMode === mode
                  ? mode === 'easy'
                    ? 'bg-green-600'
                    : mode === 'medium'
                    ? 'bg-yellow-500'
                    : 'bg-red-600'
                  : 'bg-gray-400 hover:bg-gray-500'
              }`}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>


        <div className="overflow-x-auto">
          <table className="w-full text-left border-t border-gray-200 rounded-xl overflow-hidden">
            <thead className="text-xs font-semibold text-gray-600 uppercase bg-gray-100">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-800">
              {leaderboard.map((entry, i) => (
                <tr
                  key={entry.rank}
                  className={`transition duration-200 hover:bg-gray-50 ${
                    i === 0
                      ? 'bg-yellow-50 text-red-700 font-extrabold border-b-2 border-yellow-300 shadow-lg'
                      : 'border-b'
                  }`}
                >
                  <td className="py-3 px-4 flex items-center gap-2">
                    {i === 0 && '👑'}
                    {i === 1 && '🥈'}
                    {i === 2 && '🥉'}
                    {entry.rank}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span>{entry.player}</span>
                      <span className="text-xs text-gray-500">Best: {entry.best} 🔥</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">{entry.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/game"
            className="inline-block bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold px-8 py-3 rounded-full transition-all shadow-lg"
          >
            🎮 Play Now
          </a>
        </div>
      </div>


      <footer className="mt-6 text-center text-sm text-white bg-black/30 p-4 rounded-xl max-w-xl mx-auto shadow-inner">
        <span className="italic">🇹🇹 Did you know?</span> {triniFacts[factIndex]}
      </footer>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl relative">
            <button
              className="absolute top-3 right-3 text-sm bg-red-500 text-white px-3 py-1 rounded-full"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
            <h3 className="text-xl font-bold mb-4">Top 100 Players </h3>
          </div>
        </div>
      )}
    </div>
  )
}