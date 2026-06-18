import React, { useState, useEffect, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { getQuizzes, getActiveRooms, createRoom } from '../api/quizApi'

export default function HomePage() {
  const { state, navigate, joinRoom, logout } = useApp()
  const { username } = state

  const [quizzes, setQuizzes] = useState([])
  const [rooms, setRooms] = useState([])
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joiningRoom, setJoiningRoom] = useState(null) // roomCode being joined
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [q, r] = await Promise.all([getQuizzes(), getActiveRooms()])
      setQuizzes(q)
      setRooms(r)
    } catch {
      // ignore network errors on initial load
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleCreateRoom = async (quizId) => {
    try {
      const roomInfo = await createRoom(quizId, username)
      await joinRoom(roomInfo.code, username)
    } catch (err) {
      setJoinError(err.message)
    }
  }

  const handleJoinByCode = async (e) => {
    e.preventDefault()
    const code = joinCode.trim().toUpperCase()
    if (code.length !== 4) { setJoinError('Room codes are 4 letters'); return }
    setJoiningRoom(code)
    setJoinError('')
    try {
      await joinRoom(code, username)
    } catch (err) {
      setJoinError(err.message || 'Room not found — check the code and try again')
    } finally {
      setJoiningRoom(null)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Top Nav */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <span className="font-extrabold text-violet-700 text-xl">VoteWave</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:block">
              Playing as <span className="font-semibold text-slate-700">@{username}</span>
            </span>
            <button onClick={logout} className="btn-ghost text-sm">Sign out</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Join by code banner */}
        <div className="card bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          <h2 className="font-bold text-lg mb-1">Got a room code? 🔑</h2>
          <p className="text-violet-200 text-sm mb-4">Enter the 4-letter code your friend shared</p>
          <form onSubmit={handleJoinByCode} className="flex gap-2">
            <input
              className="flex-1 bg-white/20 border-2 border-white/30 focus:border-white focus:outline-none rounded-2xl px-4 py-2.5 text-white placeholder-violet-300 font-mono text-lg uppercase tracking-widest"
              placeholder="ABCD"
              value={joinCode}
              onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError('') }}
              maxLength={4}
            />
            <button
              type="submit"
              disabled={!!joiningRoom}
              className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-amber-900 font-bold px-6 py-2.5 rounded-2xl transition-all duration-150 disabled:opacity-60 whitespace-nowrap"
            >
              {joiningRoom ? '⏳ Joining…' : 'Join Room →'}
            </button>
          </form>
          {joinError && (
            <p className="text-rose-300 text-sm mt-2 font-medium">⚠️ {joinError}</p>
          )}
        </div>

        {/* Active Rooms */}
        {rooms.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              🟢 Open Rooms
              <span className="badge bg-violet-100 text-violet-700">{rooms.length}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rooms.map((room) => (
                <RoomCard
                  key={room.code}
                  room={room}
                  onJoin={() => {
                    setJoiningRoom(room.code)
                    setJoinError('')
                    joinRoom(room.code, username)
                      .catch((err) => setJoinError(err.message))
                      .finally(() => setJoiningRoom(null))
                  }}
                  joining={joiningRoom === room.code}
                />
              ))}
            </div>
          </section>
        )}

        {/* My Quizzes */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              📋 Quizzes
            </h2>
            <button
              onClick={() => navigate('quiz-builder')}
              className="btn-primary text-sm"
            >
              + Create Quiz
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse bg-slate-100 h-20" />
              ))}
            </div>
          ) : quizzes.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-slate-500 font-medium">No quizzes yet</p>
              <p className="text-slate-400 text-sm mt-1">Create one to get started!</p>
              <button
                onClick={() => navigate('quiz-builder')}
                className="btn-primary mt-4 inline-block"
              >
                Create my first quiz
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onCreateRoom={() => handleCreateRoom(quiz.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function QuizCard({ quiz, onCreateRoom }) {
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    setCreating(true)
    await onCreateRoom()
    setCreating(false)
  }

  return (
    <div className="card flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h3 className="font-bold text-slate-800 truncate">{quiz.title}</h3>
        <p className="text-slate-500 text-sm mt-0.5">
          {quiz.questions?.length ?? 0} question{quiz.questions?.length !== 1 ? 's' : ''}
        </p>
      </div>
      <button
        onClick={handleCreate}
        disabled={creating}
        className="btn-primary text-sm whitespace-nowrap"
      >
        {creating ? '⏳' : '🚀 Host Room'}
      </button>
    </div>
  )
}

function RoomCard({ room, onJoin, joining }) {
  return (
    <div className="card flex items-center justify-between gap-4">
      <div>
        <div className="font-mono text-2xl font-black text-violet-700 tracking-widest">{room.code}</div>
        <p className="text-slate-700 font-semibold text-sm mt-0.5">{room.quizTitle}</p>
        <p className="text-slate-400 text-xs mt-0.5">
          👑 {room.hostUsername} · {room.players.length} player{room.players.length !== 1 ? 's' : ''}
        </p>
      </div>
      <button
        onClick={onJoin}
        disabled={joining}
        className="btn-secondary text-sm whitespace-nowrap"
      >
        {joining ? '⏳' : 'Join →'}
      </button>
    </div>
  )
}
