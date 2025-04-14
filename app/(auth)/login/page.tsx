'use client'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white bg-cover bg-center flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-red-600 mb-6">TriniGeo Login</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              className="w-full p-3 rounded-lg border border-gray-300"
              placeholder="Enter your email"
              required
            />
</div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full p-3 rounded-lg border border-gray-300"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg"
          >
Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          New to TriniGeo?{' '}
          <a href="/signup" className="text-red-600 font-semibold hover:underline">
            Sign up now
          </a>
        </p>
      </div>
    </div>
  )
}