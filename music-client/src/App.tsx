import { useApp } from './store/AppContext'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import RoomPage from './pages/RoomPage'

export default function App() {
  const { token, roomId } = useApp()

  if (!token) return <AuthPage />
  if (!roomId) return <HomePage />
  return <RoomPage />
}