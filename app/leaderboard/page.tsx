'use client'

import { useEffect, useState } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import { LogOut, ChevronDown, ChevronUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/useAuthStore'

type Difficulty = 'easy' | 'medium' | 'hard'

type LeaderboardEntry = {
  username: string;
  score: number;
  rank: number;
  timestamp?: string;
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
  const [factIndex, setFactIndex] = useState(0)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showMore, setShowMore] = useState(false)
  const { width, height } = useWindowSize()
  const { user, logout } = useAuthStore()
  const router = useRouter()

  
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
  
  const fetchLeaderboardData = async (mode: Difficulty) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/leaderboard?mode=${mode}&limit=50`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }
      
      const data = await response.json();
      
     
      const sortedLeaders = (data.leaders || [])
        .sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score)  
        .map((leader: LeaderboardEntry, index: number) => ({
          ...leader,
          rank: index + 1 
        }));
      
      setLeaderboard(sortedLeaders);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthReady && user) {
      fetchLeaderboardData(selectedMode);
    }
  }, [selectedMode, isAuthReady, user]);

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


  const topEntries = leaderboard.slice(0, 5);
  

  const expandedEntries = leaderboard.slice(5);
  
  if (!isAuthReady) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[url('/images/bg.png')] bg-cover bg-fixed bg-center px-4 py-8 text-gray-800">
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={200} recycle={false} />}

  
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8 px-2 sm:px-4">
        <div className="flex items-center space-x-3">
        <div className="w-14 h-14 rounded-full overflow-hidden shadow-md">
          <img 
          src="/images/logo.png" 
          alt="Logo" 
          className="w-full h-full object-cover" 
          />
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
        </div>

   
        <div className="flex justify-center gap-3 mb-6">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setSelectedMode(mode);
                setShowMore(false);
              }}
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
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center text-gray-500">
                    Loading leaderboard data...
                  </td>
                </tr>
              ) : topEntries.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center text-gray-500">
                    No scores recorded yet. Be the first to play!
                  </td>
                </tr>
              ) : (
                topEntries.map((entry, i) => (
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
                        <span>{entry.username}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">{entry.score}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && expandedEntries.length > 0 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowMore(!showMore)}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              {showMore ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" /> Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" /> View More
                </>
              )}
            </button>
            {showMore && (
              <p className="text-xs text-gray-500 mt-1">
                Only top 50 players are shown
              </p>
            )}
          </div>
        )}

        {showMore && expandedEntries.length > 0 && (
          <div className="mt-4">
            <div className="max-h-[300px] overflow-y-auto border rounded-lg">
              <table className="w-full text-left">
                <thead className="text-xs font-semibold text-gray-600 uppercase bg-gray-100 sticky top-0">
                  <tr>
                    <th className="py-2 px-4">#</th>
                    <th className="py-2 px-4">Player</th>
                    <th className="py-2 px-4 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-800">
                  {expandedEntries.map((entry) => (
                    <tr
                      key={entry.rank}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-2 px-4">{entry.rank}</td>
                      <td className="py-2 px-4">{entry.username}</td>
                      <td className="py-2 px-4 text-right font-semibold">{entry.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
        <span className="italic">Did you know?</span> {triniFacts[factIndex]}
      </footer>
    </div>
  )
}