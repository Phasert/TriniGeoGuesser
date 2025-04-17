'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Signup failed')
    } else {
      alert('Check yuh email and verify before logging in.')
      router.push('/login')
    }
  }

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-black via-red-700 to-white flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className="absolute text-[250px] md:text-[400px] opacity-5 font-extrabold text-white pointer-events-none select-none z-0">
        🇹🇹
      </div>

      <div className="z-10 w-full max-w-md bg-white/90 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-red-300">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-red-600 tracking-tight drop-shadow-md">
            Create Your TriniGeo Account
          </h1>
          <p className="text-sm text-gray-600 mt-1">Explore sweet T&T today!</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500"
              placeholder="lime"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-transform duration-150 active:scale-95"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-700">
          Already have an account?{' '}
          <a href="/login" className="text-red-600 font-semibold hover:underline">Login here</a>
        </p>
      </div>
    </section>
  )
}