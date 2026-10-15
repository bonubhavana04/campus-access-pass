import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ResourcesPage from './pages/ResourcesPage'
import RequestsPage from './pages/RequestsPage'
import PassesPage from './pages/PassesPage'
import VerifyPage from './pages/VerifyPage'
import ApproverPage from './pages/ApproverPage'

function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'VERIFIER') return <Navigate to="/verify" replace />
  if (user.role === 'APPROVER') return <Navigate to="/approver" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={
        <ProtectedRoute roles={['STUDENT', 'ADMIN']}>
          <DashboardPage />
        </ProtectedRoute>
      } />

      <Route path="/resources" element={
        <ProtectedRoute roles={['STUDENT', 'ADMIN']}>
          <ResourcesPage />
        </ProtectedRoute>
      } />

      <Route path="/requests" element={
        <ProtectedRoute roles={['STUDENT', 'ADMIN']}>
          <RequestsPage />
        </ProtectedRoute>
      } />

      <Route path="/passes" element={
        <ProtectedRoute roles={['STUDENT', 'ADMIN']}>
          <PassesPage />
        </ProtectedRoute>
      } />

      <Route path="/verify" element={
        <ProtectedRoute roles={['VERIFIER', 'ADMIN']}>
          <VerifyPage />
        </ProtectedRoute>
      } />

      <Route path="/approver" element={
        <ProtectedRoute roles={['APPROVER', 'ADMIN']}>
          <ApproverPage />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
