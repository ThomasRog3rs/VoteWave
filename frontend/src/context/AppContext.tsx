import React, { createContext, useContext, useReducer, useCallback } from 'react'
import * as signalR from '@microsoft/signalr'

// ─── State Shape ─────────────────────────────────────────────────────────────

const savedUsername = localStorage.getItem('votewave_username')

const initialState = {
  username: savedUsername,
  page: savedUsername ? 'home' : 'login',
  connection: null,
  roomCode: null,
  roomInfo: null,
  question: null,
  myAnswer: null,
  answerCount: { count: 0, total: 0 },
  results: null,
  finalScores: null,
  gamePhase: 'lobby', // 'lobby' | 'question' | 'results' | 'finished'
  error: null,
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('votewave_username', action.username)
      return { ...state, username: action.username, page: 'home', error: null }

    case 'LOGOUT':
      localStorage.removeItem('votewave_username')
      if (state.connection) state.connection.stop()
      return { ...initialState, username: null, page: 'login', connection: null }

    case 'NAVIGATE':
      return { ...state, page: action.page, error: null }

    case 'SET_CONNECTION':
      return { ...state, connection: action.connection }

    case 'JOIN_ROOM':
      return { ...state, roomCode: action.roomCode, page: 'room', gamePhase: 'lobby', error: null }

    case 'ROOM_UPDATED':
      return { ...state, roomInfo: action.roomInfo }

    case 'QUESTION_CHANGED':
      return {
        ...state,
        question: action.question,
        myAnswer: null,
        answerCount: { count: 0, total: state.roomInfo?.players?.length ?? 0 },
        results: null,
        gamePhase: 'question',
      }

    case 'SET_MY_ANSWER':
      return { ...state, myAnswer: action.choiceIndex }

    case 'ANSWER_COUNT':
      return { ...state, answerCount: { count: action.count, total: action.total } }

    case 'RESULTS_REVEALED':
      return { ...state, results: action.results, gamePhase: 'results' }

    case 'QUIZ_FINISHED':
      return { ...state, finalScores: action.scores, gamePhase: 'finished' }

    case 'LEAVE_ROOM':
      if (state.connection) state.connection.stop()
      return {
        ...state,
        connection: null,
        roomCode: null,
        roomInfo: null,
        question: null,
        myAnswer: null,
        results: null,
        finalScores: null,
        gamePhase: 'lobby',
        answerCount: { count: 0, total: 0 },
        page: 'home',
        error: null,
      }

    case 'SET_ERROR':
      return { ...state, error: action.message }

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const login = useCallback((username) => {
    dispatch({ type: 'LOGIN', username })
  }, [])

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' })
  }, [])

  const navigate = useCallback((page) => {
    dispatch({ type: 'NAVIGATE', page })
  }, [])

  const leaveRoom = useCallback(() => {
    dispatch({ type: 'LEAVE_ROOM' })
  }, [])

  // Join an existing room via SignalR
  const joinRoom = useCallback(async (roomCode, username) => {
    const upperCode = roomCode.toUpperCase().trim()

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hub/quiz')
      .withAutomaticReconnect()
      .build()

    // Latch: captures the outcome of the initial JoinRoom invoke
    let joinSettled = false
    let resolveJoin, rejectJoin
    const joinPromise = new Promise((res, rej) => {
      resolveJoin = res
      rejectJoin = rej
    })

    // Permanent event handlers registered before connecting
    connection.on('RoomUpdated', (roomInfo) => {
      if (!joinSettled) {
        joinSettled = true
        resolveJoin(roomInfo)
        // Now register ongoing handler
        connection.on('RoomUpdated', (ri) => dispatch({ type: 'ROOM_UPDATED', roomInfo: ri }))
      } else {
        dispatch({ type: 'ROOM_UPDATED', roomInfo })
      }
    })

    connection.on('Error', (msg) => {
      if (!joinSettled) {
        joinSettled = true
        connection.stop()
        rejectJoin(new Error(msg))
      }
    })

    connection.on('QuestionChanged', (question) =>
      dispatch({ type: 'QUESTION_CHANGED', question }))

    connection.on('AnswerCount', (count, total) =>
      dispatch({ type: 'ANSWER_COUNT', count, total }))

    connection.on('ResultsRevealed', (results) =>
      dispatch({ type: 'RESULTS_REVEALED', results }))

    connection.on('QuizFinished', (scores) =>
      dispatch({ type: 'QUIZ_FINISHED', scores }))

    await connection.start()
    await connection.invoke('JoinRoom', upperCode, username)

    const roomInfo = await joinPromise

    dispatch({ type: 'SET_CONNECTION', connection })
    dispatch({ type: 'JOIN_ROOM', roomCode: upperCode })
    dispatch({ type: 'ROOM_UPDATED', roomInfo })
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch, login, logout, navigate, joinRoom, leaveRoom }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
