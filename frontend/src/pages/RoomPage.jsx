import React from 'react'
import { useApp } from '../context/AppContext'
import PlayerList from '../components/PlayerList'
import QuestionCard from '../components/QuestionCard'
import AnswerProgress from '../components/AnswerProgress'
import ResultsCard from '../components/ResultsCard'
import ScoreBoard from '../components/ScoreBoard'

export default function RoomPage() {
  const { state, dispatch, leaveRoom } = useApp()
  const {
    connection, roomCode, roomInfo, question,
    myAnswer, answerCount, results, finalScores,
    gamePhase, username,
  } = state

  const isHost = roomInfo?.hostUsername === username

  const startQuiz = () => connection?.invoke('StartQuiz', roomCode, username)

  const submitAnswer = (choiceIndex) => {
    dispatch({ type: 'SET_MY_ANSWER', choiceIndex })
    connection?.invoke('SubmitAnswer', roomCode, username, choiceIndex)
  }

  const revealResults = () => connection?.invoke('RevealResults', roomCode, username)

  const nextQuestion = () => connection?.invoke('NextQuestion', roomCode, username)

  const isLastQuestion = question
    ? question.questionIndex + 1 >= question.totalQuestions
    : false

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-violet-700 text-lg tracking-widest">{roomCode}</span>
              {roomInfo && (
                <span className="text-slate-400 text-sm truncate">· {roomInfo.quizTitle}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge phase={gamePhase} />
            <button onClick={leaveRoom} className="btn-ghost text-sm">
              Leave
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Final Scores */}
        {gamePhase === 'finished' && (
          <ScoreBoard scores={finalScores ?? []} onLeave={leaveRoom} />
        )}

        {/* Lobby */}
        {gamePhase === 'lobby' && (
          <LobbyView
            roomCode={roomCode}
            roomInfo={roomInfo}
            isHost={isHost}
            onStart={startQuiz}
          />
        )}

        {/* Question */}
        {gamePhase === 'question' && question && (
          <>
            <QuestionCard
              question={question}
              myAnswer={myAnswer}
              onAnswer={submitAnswer}
              disabled={myAnswer !== null}
            />
            <AnswerProgress count={answerCount.count} total={answerCount.total} />
            {isHost && myAnswer !== null && (
              <button onClick={revealResults} className="btn-secondary w-full text-center text-sm">
                Reveal Answers Now
              </button>
            )}
          </>
        )}

        {/* Results */}
        {gamePhase === 'results' && results && question && (
          <ResultsCard
            results={results}
            question={question}
            isHost={isHost}
            isLastQuestion={isLastQuestion}
            onNext={nextQuestion}
          />
        )}
      </main>
    </div>
  )
}

// ─── Lobby View ───────────────────────────────────────────────────────────────

function LobbyView({ roomCode, roomInfo, isHost, onStart }) {
  const players = roomInfo?.players ?? []

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Room code card */}
      <div className="card text-center bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
        <p className="text-violet-300 text-sm font-semibold mb-1">Share this code to invite players</p>
        <div className="font-mono text-6xl font-black tracking-[0.25em] my-3">{roomCode}</div>
        <p className="text-violet-200 text-sm">
          {roomInfo?.quizTitle && <>📋 {roomInfo.quizTitle}</>}
        </p>
      </div>

      {/* Players */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-700">
            Players
            <span className="ml-2 badge bg-violet-100 text-violet-700">{players.length}</span>
          </h3>
          {isHost && (
            <span className="badge bg-amber-100 text-amber-700">You are the host 👑</span>
          )}
        </div>

        {players.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">
            No players yet — share the code!
          </p>
        ) : (
          <PlayerList players={players} host={roomInfo?.hostUsername} />
        )}
      </div>

      {/* Host: start button */}
      {isHost ? (
        <div className="space-y-2">
          <button
            onClick={onStart}
            disabled={players.length < 1}
            className="btn-primary w-full text-center text-base"
          >
            🚀 Start Quiz!
          </button>
          {players.length < 2 && (
            <p className="text-center text-amber-600 text-sm font-medium">
              💡 Tip: invite more players with the room code above
            </p>
          )}
        </div>
      ) : (
        <div className="card text-center bg-slate-50">
          <p className="text-slate-500 font-medium">
            ⏳ Waiting for <strong className="text-slate-700">{roomInfo?.hostUsername}</strong> to start the quiz…
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ phase }) {
  const map = {
    lobby: { label: 'Lobby', cls: 'bg-slate-100 text-slate-600' },
    question: { label: '❓ Question', cls: 'bg-violet-100 text-violet-700' },
    results: { label: '📊 Results', cls: 'bg-emerald-100 text-emerald-700' },
    finished: { label: '🏆 Finished', cls: 'bg-amber-100 text-amber-700' },
  }
  const { label, cls } = map[phase] ?? map.lobby
  return <span className={`badge ${cls} text-xs`}>{label}</span>
}
