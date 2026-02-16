import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './context/ThemeContext'

// Layout
import Layout from './components/Layout/Layout'
import PrivateRoute from './components/Layout/PrivateRoute'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DocumentUpload from './pages/DocumentUpload'
import DocumentList from './pages/DocumentList'
import DocumentDetail from './pages/DocumentDetail'
import RiskReport from './pages/RiskReport'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import NotificationsPage from './pages/NotificationsPage'
import KeyboardShortcuts from './components/KeyboardShortcuts';
import ThemeCustomizer from './components/ThemeCustomizer';

// Animated Routes Component
const AnimatedRoutes = () => {
  const location = useLocation()
  const { isAuthenticated } = useSelector((state) => state.auth)

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />

        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="upload" element={<DocumentUpload />} />
          <Route path="documents" element={<DocumentList />} />
          <Route path="documents/:id" element={<DocumentDetail />} />
          <Route path="reports/:id" element={<RiskReport />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <KeyboardShortcuts />
        <ThemeCustomizer />
        <AnimatedRoutes />
      </Router>
    </ThemeProvider>
  )
}

export default App