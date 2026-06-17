import React from 'react'

export default function AnswerProgress({ count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-600">Waiting for answers…</span>
        <span className="text-sm font-bold text-violet-700">{count} / {total}</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
