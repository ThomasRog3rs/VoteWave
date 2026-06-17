import React from 'react'
import { useApp } from './context/AppContext'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import QuizBuilderPage from './pages/QuizBuilderPage'
import RoomPage from './pages/RoomPage'

export default function App() {
  const { state } = useApp()

  switch (state.page) {
    case 'login': return <LoginPage />
    case 'home': return <HomePage />
    case 'quiz-builder': return <QuizBuilderPage />
    case 'room': return <RoomPage />
    default: return <LoginPage />
  }
}
