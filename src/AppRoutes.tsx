import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import type { Company } from './lib/types'
import { getSavedAccessCode, loginWithAccessCode } from './lib/auth'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import SettingsPage from './pages/SettingsPage'
import DocumentEditPage from './pages/DocumentEditPage'
import HistoryPage from './pages/HistoryPage'
import UpgradeSuccessPage from './pages/UpgradeSuccessPage'

export default function AppRoutes() {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const autoLogin = async () => {
      const savedCode = getSavedAccessCode()
      if (savedCode) {
        const c = await loginWithAccessCode(savedCode)
        if (c) setCompany(c)
      }
      setLoading(false)
    }
    autoLogin()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-navy border-t-transparent"></div>
      </div>
    )
  }

  if (!company) {
    return <LoginPage onLogin={setCompany} />
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage company={company} />} />
      <Route path="/settings" element={<SettingsPage company={company} onUpdate={setCompany} />} />
      <Route path="/document/new/:docType" element={<DocumentEditPage company={company} />} />
      <Route path="/document/edit/:id" element={<DocumentEditPage company={company} />} />
      <Route path="/history" element={<HistoryPage company={company} />} />
      <Route path="/upgrade/success" element={<UpgradeSuccessPage onUpdate={setCompany} />} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}
