import React from 'react'

const CHOICE_BG = ['bg-rose-500', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500']
const CHOICE_LABELS = ['A', 'B', 'C', 'D']

export default function ResultsCard({ results, question, isHost, isLastQuestion, onNext }) {
  const { correctIndex, answers, scores } = results

  return (
    <div className="space-y-4 animate-bounce-in">
      {/* Correct answer banner */}
      <div className={`${CHOICE_BG[correctIndex]} rounded-3xl p-5 text-white`}>
        <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1">Correct Answer</p>
        <div className="flex items-center gap-3">
          <span className="bg-white/20 rounded-xl w-10 h-10 flex items-center justify-center font-bold text-lg">
            {CHOICE_LABELS[correctIndex]}
          </span>
          <span className="text-xl font-bold">{question?.choices?.[correctIndex]}</span>
        </div>
      </div>

      {/* Player results */}
      <div className="card space-y-2">
        <h3 className="font-bold text-slate-700 mb-3">How everyone did</h3>
        {answers.map((a) => (
          <PlayerResult key={a.username} answer={a} correctIndex={correctIndex} score={scores[a.username] ?? 0} />
        ))}
      </div>

      {/* Host controls */}
      {isHost && (
        <button
          onClick={onNext}
          className="btn-primary w-full text-center text-base"
        >
          {isLastQuestion ? '🏆 See Final Scores' : '→ Next Question'}
        </button>
      )}

      {!isHost && (
        <p className="text-center text-slate-400 text-sm font-medium">
          ⏳ Waiting for the quiz master to continue…
        </p>
      )}
    </div>
  )
}

function PlayerResult({ answer, correctIndex, score }) {
  const correct = answer.choiceIndex === correctIndex
  const noAnswer = answer.choiceIndex === -1

  return (
    <div className={`flex items-center justify-between p-3 rounded-2xl ${
      correct ? 'bg-emerald-50' : noAnswer ? 'bg-slate-50' : 'bg-rose-50'
    }`}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{correct ? '✅' : noAnswer ? '⏱️' : '❌'}</span>
        <span className="font-semibold text-slate-800">{answer.username}</span>
        {noAnswer && <span className="text-slate-400 text-xs">(no answer)</span>}
      </div>
      <span className={`font-bold text-sm ${correct ? 'text-emerald-600' : 'text-slate-400'}`}>
        {score} pts
      </span>
    </div>
  )
}
