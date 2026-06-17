import React from 'react'

const CHOICE_COLORS_NORMAL = [
  'bg-rose-500 hover:bg-rose-600 text-white',
  'bg-blue-500 hover:bg-blue-600 text-white',
  'bg-amber-500 hover:bg-amber-600 text-white',
  'bg-emerald-500 hover:bg-emerald-600 text-white',
]

const CHOICE_COLORS_SELECTED = [
  'bg-rose-600 ring-4 ring-rose-300 text-white scale-105',
  'bg-blue-600 ring-4 ring-blue-300 text-white scale-105',
  'bg-amber-600 ring-4 ring-amber-300 text-white scale-105',
  'bg-emerald-600 ring-4 ring-emerald-300 text-white scale-105',
]

const LABELS = ['A', 'B', 'C', 'D']

export default function QuestionCard({ question, myAnswer, onAnswer, disabled }) {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Question text */}
      <div className="card text-center">
        <p className="text-xs font-semibold text-violet-500 uppercase tracking-widest mb-3">
          Question {question.questionIndex + 1} of {question.totalQuestions}
        </p>
        <p className="text-2xl font-bold text-slate-800 leading-snug">{question.text}</p>
      </div>

      {/* Answer choices 2×2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {question.choices.map((choice, i) => {
          const isSelected = myAnswer === i
          const colors = isSelected ? CHOICE_COLORS_SELECTED[i] : CHOICE_COLORS_NORMAL[i]
          return (
            <button
              key={i}
              onClick={() => !disabled && onAnswer(i)}
              disabled={disabled}
              className={`rounded-2xl p-4 font-semibold text-left flex items-start gap-3 transition-all duration-150 active:scale-95 disabled:cursor-default ${colors} ${
                myAnswer !== null && !isSelected ? 'opacity-60' : ''
              }`}
            >
              <span className="bg-white/20 rounded-lg w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {LABELS[i]}
              </span>
              <span className="text-sm leading-snug">{choice}</span>
            </button>
          )
        })}
      </div>

      {myAnswer !== null && (
        <p className="text-center text-slate-500 text-sm font-medium animate-fade-up">
          ✅ Answer locked in — waiting for others…
        </p>
      )}
    </div>
  )
}
