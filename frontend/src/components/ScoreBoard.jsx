import React from 'react'

const MEDALS = ['🥇', '🥈', '🥉']
const PODIUM_COLORS = [
  'bg-gradient-to-br from-amber-400 to-amber-500 text-white',
  'bg-gradient-to-br from-slate-300 to-slate-400 text-white',
  'bg-gradient-to-br from-orange-400 to-orange-500 text-white',
]

export default function ScoreBoard({ scores = [], onLeave }) {
  return (
    <div className="space-y-6 animate-bounce-in">
      {/* Header */}
      <div className="text-center">
        <div className="text-6xl mb-2">🏆</div>
        <h2 className="text-3xl font-extrabold text-slate-800">Final Scores</h2>
        <p className="text-slate-500 mt-1">Well played everyone!</p>
      </div>

      {/* Top 3 podium */}
      {scores.length >= 1 && (
        <div className="flex items-end justify-center gap-3 px-4">
          {scores.slice(0, 3).map((entry, i) => {
            // Reorder for visual podium: 2nd, 1st, 3rd
            const podiumOrder = [1, 0, 2]
            const displayIndex = podiumOrder.indexOf(i)
            return (
              <PodiumStep key={entry.username} entry={entry} rank={i} displayRank={displayIndex} />
            )
          })}
        </div>
      )}

      {/* Full leaderboard */}
      <div className="card space-y-2">
        {scores.map((entry, i) => (
          <div
            key={entry.username}
            className={`flex items-center gap-3 p-3 rounded-2xl ${i === 0 ? 'bg-amber-50' : 'bg-slate-50'}`}
          >
            <span className="w-8 text-center text-lg">{MEDALS[i] ?? `${i + 1}.`}</span>
            <span className="flex-1 font-bold text-slate-800">{entry.username}</span>
            <span className="font-extrabold text-violet-700">{entry.score}</span>
            <span className="text-slate-400 text-xs">pts</span>
          </div>
        ))}
      </div>

      <button onClick={onLeave} className="btn-primary w-full text-center">
        Back to Home 🎉
      </button>
    </div>
  )
}

function PodiumStep({ entry, rank, displayRank }) {
  const heights = ['h-24', 'h-16', 'h-12']
  const colors = PODIUM_COLORS

  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <span className="text-2xl">{MEDALS[rank] ?? '🏅'}</span>
      <span className="text-xs font-bold text-slate-600 text-center truncate w-full text-center">
        {entry.username}
      </span>
      <div
        className={`w-full ${heights[rank]} ${colors[rank]} rounded-t-2xl flex items-center justify-center font-extrabold text-xl`}
      >
        {entry.score}
      </div>
    </div>
  )
}
