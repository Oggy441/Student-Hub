import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navigation from './components/shared/Navigation'
import HomePage from './components/home/HomePage'
import NotesPage from './components/notes/NotesPage'
import GradesPage from './components/grades/GradesPage'
import SchedulePage from './components/schedule/SchedulePage'
import SettingsPage from './components/settings/SettingsPage'
import LoginPage from './components/auth/LoginPage'
import SignupPage from './components/auth/SignupPage'
import PrivateRoute from './components/auth/PrivateRoute'
import ErrorBoundary from './components/shared/ErrorBoundary'
import NotFound from './components/shared/NotFound'
import './App.css'

function AppContent() {
  const { currentUser } = useAuth()

  return (
    <div className="app">
      <div className="app-content">
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/" />} />
            <Route path="/signup" element={!currentUser ? <SignupPage /> : <Navigate to="/" />} />

            {/* Protected Routes */}
            <Route path="/" element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            } />
            <Route path="/notes" element={
              <PrivateRoute>
                <NotesPage />
              </PrivateRoute>
            } />
            <Route path="/grades" element={
              <PrivateRoute>
                <GradesPage />
              </PrivateRoute>
            } />
            <Route path="/schedule" element={
              <PrivateRoute>
                <SchedulePage />
              </PrivateRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            } />

            {/* Catch-all Route for 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </div>

      {/* Show navigation only when logged in */}
      {currentUser && <Navigation />}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App