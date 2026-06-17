import React, { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function LoginPage() {
  const { login } = useApp()
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = username.trim()
    if (!trimmed) { setError('Please enter a username'); return }
    if (trimmed.length < 2) { setError('Username must be at least 2 characters'); return }
    if (trimmed.length > 20) { setError('Username must be 20 characters or less'); return }
    login(trimmed)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Hero */}
      <div className="text-center mb-10 animate-fade-up">
        <div className="text-7xl mb-4">🎉</div>
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
          VoteWave
        </h1>
        <p className="mt-3 text-lg text-slate-500 font-medium">
          Live multiplayer quizzes — play with friends!
        </p>
      </div>

      {/* Card */}
      <div className="card w-full max-w-sm animate-bounce-in">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Welcome! 👋</h2>
        <p className="text-slate-500 text-sm mb-6">Enter a username to get started</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              className="input"
              type="text"
              placeholder="Your username…"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError('') }}
              maxLength={20}
              autoFocus
            />
            {error && (
              <p className="text-rose-500 text-sm mt-1.5 font-medium">{error}</p>
            )}
          </div>

          <button type="submit" className="btn-primary w-full text-center">
            Let's Play! 🚀
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-4">
          No account needed — just pick a name!
        </p>
      </div>

      {/* Fun floating emojis (decorative) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden>
        {['🎯', '⭐', '🏆', '💡', '🎊', '✨'].map((emoji, i) => (
          <span
            key={i}
            className="absolute text-4xl opacity-10 select-none"
            style={{
              left: `${10 + i * 16}%`,
              top: `${15 + (i % 3) * 25}%`,
              transform: `rotate(${i * 15 - 30}deg)`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>
    </div>
  )
}
