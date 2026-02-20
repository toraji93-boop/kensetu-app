import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// アプリ部分はSupabaseに依存するため遅延読み込み
const AppRoutes = lazy(() => import('./AppRoutes'))

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/app/*"
          element={
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-navy border-t-transparent"></div>
                </div>
              }
            >
              <AppRoutes />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
