import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { createQuiz } from '../api/quizApi'

const EMPTY_CHOICE = () => ({ text: '' })
const EMPTY_QUESTION = () => ({
  text: '',
  choices: [EMPTY_CHOICE(), EMPTY_CHOICE(), EMPTY_CHOICE(), EMPTY_CHOICE()],
  correctIndex: 0,
})

const CHOICE_LABELS = ['A', 'B', 'C', 'D']
const CHOICE_COLORS = [
  'bg-rose-500',
  'bg-blue-500',
  'bg-amber-500',
  'bg-emerald-500',
]

export default function QuizBuilderPage() {
  const { navigate } = useApp()

  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState([EMPTY_QUESTION()])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  // ─── Validation ──────────────────────────────────────────────────────────

  const validate = () => {
    const errs = {}
    if (!title.trim()) errs.title = 'Quiz title is required'
    questions.forEach((q, qi) => {
      if (!q.text.trim()) errs[`q_${qi}`] = 'Question text is required'
      q.choices.forEach((c, ci) => {
        if (!c.text.trim()) errs[`q_${qi}_c_${ci}`] = 'All choices are required'
      })
    })
    return errs
  }

  // ─── Handlers ────────────────────────────────────────────────────────────

  const updateQuestion = (qi, field, value) =>
    setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, [field]: value } : q)))

  const updateChoice = (qi, ci, value) =>
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qi
          ? { ...q, choices: q.choices.map((c, j) => (j === ci ? { text: value } : c)) }
          : q
      )
    )

  const addQuestion = () => setQuestions((qs) => [...qs, EMPTY_QUESTION()])

  const removeQuestion = (qi) =>
    setQuestions((qs) => qs.filter((_, i) => i !== qi))

  const handleSave = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      await createQuiz({
        title: title.trim(),
        questions: questions.map((q) => ({
          text: q.text.trim(),
          correctIndex: q.correctIndex,
          choices: q.choices.map((c) => ({ text: c.text.trim() })),
        })),
      })
      navigate('home')
    } catch (err) {
      setErrors({ save: err.message })
    } finally {
      setSaving(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate('home')} className="btn-ghost text-sm">
            ← Back
          </button>
          <h1 className="font-extrabold text-violet-700 text-lg flex-1">New Quiz</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-sm"
          >
            {saving ? '⏳ Saving…' : '✅ Save Quiz'}
          </button>
        </div>
      </header>

      <form onSubmit={handleSave} className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Title */}
        <div className="card">
          <label className="block text-sm font-semibold text-slate-600 mb-2">Quiz Title</label>
          <input
            className="input"
            placeholder="e.g. World Geography Challenge"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors((e) => ({ ...e, title: undefined })) }}
          />
          {errors.title && <p className="text-rose-500 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Questions */}
        {questions.map((q, qi) => (
          <QuestionEditor
            key={qi}
            index={qi}
            question={q}
            errors={errors}
            onUpdateText={(val) => { updateQuestion(qi, 'text', val); setErrors((e) => ({ ...e, [`q_${qi}`]: undefined })) }}
            onUpdateChoice={(ci, val) => { updateChoice(qi, ci, val); setErrors((e) => ({ ...e, [`q_${qi}_c_${ci}`]: undefined })) }}
            onSetCorrect={(ci) => updateQuestion(qi, 'correctIndex', ci)}
            onRemove={questions.length > 1 ? () => removeQuestion(qi) : null}
          />
        ))}

        {/* Add Question */}
        <button
          type="button"
          onClick={addQuestion}
          className="btn-secondary w-full text-center"
        >
          + Add Question
        </button>

        {errors.save && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3 text-sm">
            ⚠️ {errors.save}
          </div>
        )}
      </form>
    </div>
  )
}

function QuestionEditor({ index, question, errors, onUpdateText, onUpdateChoice, onSetCorrect, onRemove }) {
  return (
    <div className="card space-y-4 animate-fade-up">
      {/* Question header */}
      <div className="flex items-center justify-between">
        <span className="badge bg-violet-100 text-violet-700 text-sm font-bold">
          Question {index + 1}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-slate-400 hover:text-rose-500 transition-colors text-sm font-medium"
          >
            Remove
          </button>
        )}
      </div>

      {/* Question text */}
      <div>
        <textarea
          className="input resize-none"
          rows={2}
          placeholder="Type your question here…"
          value={question.text}
          onChange={(e) => onUpdateText(e.target.value)}
        />
        {errors[`q_${index}`] && (
          <p className="text-rose-500 text-sm mt-1">{errors[`q_${index}`]}</p>
        )}
      </div>

      {/* Choices */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Choices — click ✅ to mark the correct answer
        </p>
        {question.choices.map((choice, ci) => (
          <div key={ci} className="flex items-center gap-2">
            {/* Correct indicator */}
            <button
              type="button"
              onClick={() => onSetCorrect(ci)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all duration-150 ${
                question.correctIndex === ci
                  ? `${CHOICE_COLORS[ci]} text-white scale-110`
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
              title="Mark as correct answer"
            >
              {question.correctIndex === ci ? '✓' : CHOICE_LABELS[ci]}
            </button>

            <input
              className="input text-sm"
              placeholder={`Choice ${CHOICE_LABELS[ci]}`}
              value={choice.text}
              onChange={(e) => onUpdateChoice(ci, e.target.value)}
            />
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400">
        ✓ Correct answer: <strong className="text-slate-600">{CHOICE_LABELS[question.correctIndex]}</strong>
      </p>
    </div>
  )
}
