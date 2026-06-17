import React, {useState} from 'react'
import * as signalR from '@microsoft/signalr'

export default function App(){
  const [name, setName] = useState('Player')
  const [room, setRoom] = useState('room1')
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [conn, setConn] = useState(null)

  const connect = async ()=>{
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:18080/hub/quiz')
      .withAutomaticReconnect()
      .build()

    connection.on('PlayerJoined', (username)=> setMessages(m=>[...m, `${username} joined`]))
    connection.on('QuizStarted', ()=> setMessages(m=>[...m, 'Quiz started']))

    await connection.start()
    await connection.invoke('JoinRoom', room, name)
    setConn(connection)
    setConnected(true)
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Quiz Demo</h1>
      <div className="mt-4">
        <input value={name} onChange={e=>setName(e.target.value)} className="border p-2" />
        <input value={room} onChange={e=>setRoom(e.target.value)} className="border p-2 ml-2" />
        <button onClick={connect} className="bg-blue-500 text-white p-2 ml-2">Join</button>
      </div>

      <div className="mt-4">
        <h2 className="font-semibold">Messages</h2>
        <ul>
          {messages.map((m,i)=><li key={i}>{m}</li>)}
        </ul>
      </div>
    </div>
  )
}
