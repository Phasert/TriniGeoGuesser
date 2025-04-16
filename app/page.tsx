'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-red-100 to-white flex items-center justify-center px-4 py-16">
      <div className="max-w-3xl w-full text-center space-y-8 bg-white/90 rounded-2xl shadow-xl p-10 border border-red-100">
        <h1 className="text-4xl md:text-5xl font-extrabold text-red-600 drop-shadow">
          🇹🇹 Welcome to <span className="text-green-600">Trini</span><span className= "text-red-600">Geo</span>
        </h1>

        <p className="text-gray-700 text-lg md:text-xl font-medium">
          This is not just a game — it&apos;s a way to <span className="text-red-600 font-bold">learn about our sweet island</span> through interactive geography.
        </p>

        <div className="grid md:grid-cols-2 gap-6 text-left text-sm md:text-base mt-6">
          <div className="bg-red-100/60 p-4 rounded-lg">
            🗺️ Drop pins where you think local landmarks are.
          </div>
          <div className="bg-green-100/60 p-4 rounded-lg">
            📚 Get fun facts about each location after every guess.
          </div>
          <div className="bg-yellow-100/60 p-4 rounded-lg">
            🧠 Learn about Trinidad & Tobago&apos;s rich culture and history.
          </div>
          <div className="bg-blue-100/60 p-4 rounded-lg">
            🏆 Compete for high scores on the leaderboard.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/login">
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-full">
              Login
            </button>
          </Link>
          <Link href="/signup">
            <button className="bg-white text-red-600 border border-red-600 hover:bg-red-100 font-bold px-6 py-3 rounded-full">
              Sign Up
            </button>
          </Link>
        </div>

        
      </div>
    </div>
  )
}
