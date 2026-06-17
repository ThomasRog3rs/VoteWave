const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json()
}

// ─── Quizzes ─────────────────────────────────────────────────────────────────

export const getQuizzes = () => request('/quizzes')

export const getQuiz = (id) => request(`/quizzes/${id}`)

export const createQuiz = (quiz) =>
  request('/quizzes', { method: 'POST', body: JSON.stringify(quiz) })

// ─── Rooms ───────────────────────────────────────────────────────────────────

export const getActiveRooms = () => request('/rooms')

export const createRoom = (quizId, hostUsername) =>
  request('/rooms', {
    method: 'POST',
    body: JSON.stringify({ quizId, hostUsername }),
  })
