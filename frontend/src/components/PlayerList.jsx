import React from 'react'

export default function PlayerList({ players = [], host }) {
  return (
    <div className="flex flex-wrap gap-2">
      {players.map((name) => (
        <PlayerChip key={name} name={name} isHost={name === host} />
      ))}
    </div>
  )
}

function PlayerChip({ name, isHost }) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
        isHost
          ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-300'
          : 'bg-violet-100 text-violet-700'
      }`}
    >
      {isHost && <span>👑</span>}
      <span>{name}</span>
    </div>
  )
}
