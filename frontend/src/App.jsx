import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import AnalysisPage from './pages/AnalysisPage'
import HistoryPage from './pages/HistoryPage'
import AboutPage from './pages/AboutPage'
import LandingPage from './pages/LandingPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import OnboardingPage from './pages/OnboardingPage'
import LoadingSpinner from './components/LoadingSpinner'
import AdminDashboard from './pages/AdminDashboard'

function ProtectedRoute({ children, requireOnboarding = true }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (requireOnboarding && user && user.onboardingCompleted === false) {
    return <Navigate to="/onboarding" replace />
  }
  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/home" replace />
  return children
}

export default function App() {
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    // Simulate initial enterprise system initialization
    const timer = setTimeout(() => {
      setInitialLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <BrowserRouter>
      {initialLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50/50 backdrop-blur-md animate-fade-in transition-all duration-500">
          <LoadingSpinner message="Setting Up Forecastify Workspace" />
        </div>
      )}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          },
          success: {
            iconTheme: { primary: '#0d9488', secondary: '#fff' },
            style: { borderLeft: '4px solid #0d9488' },
          },
          error: {
            iconTheme: { primary: '#f43f5e', secondary: '#fff' },
            style: { borderLeft: '4px solid #f43f5e' },
          },
        }}
      />
      <Routes>
        <Route 
          path="/" 
          element={<LandingPage />} 
        />
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="home" element={<HomePage />} />
          <Route path="analysis" element={<AnalysisPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
        
        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoute requireOnboarding={false}>
              <OnboardingPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
