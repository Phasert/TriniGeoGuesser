'use client'

export default function SignupPage() {
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

        <form className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500"
              placeholder="lime"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500"
              placeholder="you@example.com"
              required/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500"
                placeholder="••••••••"
                required
              />
              </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500"
              placeholder="••••••••"
              required
            />
          </div>
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