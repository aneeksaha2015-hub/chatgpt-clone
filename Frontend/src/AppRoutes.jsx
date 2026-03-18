import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import React, { lazy, Suspense, useEffect, useState } from 'react'
import axios from 'axios'

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))

const BASE_URL = 'http://localhost:3000'

const LoadingFallback = () => (
  <div style={{
    width: '100vw',
    height: '100dvh',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }} />
)

const ProtectedRoute = ({ user, loading, children }) => {
  if (loading) return <LoadingFallback />
  if (!user) return <Navigate to='/login' replace />
  return children
}

const GuestRoute = ({ user, loading, children }) => {
  if (loading) return <LoadingFallback />
  if (user) return <Navigate to='/' replace />
  return children
}

const AppRoutes = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${BASE_URL}/api/auth/me`, { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route
            path='/'
            element={
              <ProtectedRoute user={user} loading={loading}>
                <Home user={user} setUser={setUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path='/login'
            element={
              <GuestRoute user={user} loading={loading}>
                <Login setUser={setUser} />
              </GuestRoute>
            }
          />
          <Route
            path='/register'
            element={
              <GuestRoute user={user} loading={loading}>
                <Register setUser={setUser} />
              </GuestRoute>
            }
          />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default AppRoutes