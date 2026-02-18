import { useState } from 'react'
import type { Company } from '../lib/types'
import { loginWithAccessCode, registerCompany, checkRateLimit, recordLoginAttempt } from '../lib/auth'
import Spinner from '../components/Spinner'

interface Props {
  onLogin: (company: Company) => void
}

export default function LoginPage({ onLogin }: Props) {
  const [mode, setMode] = useState<'top' | 'login' | 'register' | 'registered'>('top')
  const [accessCode, setAccessCode] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [newAccessCode, setNewAccessCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!accessCode.trim()) {
      setError('アクセスコードを入力してください')
      return
    }
    const rateCheck = checkRateLimit()
    if (!rateCheck.allowed) {
      const min = Math.ceil(rateCheck.remainingSeconds / 60)
      setError(`ログイン試行回数が上限に達しました。${min}分後に再試行してください。`)
      return
    }
    setLoading(true)
    setError('')
    const company = await loginWithAccessCode(accessCode.trim())
    setLoading(false)
    if (company) {
      onLogin(company)
    } else {
      recordLoginAttempt()
      setError('アクセスコードが見つかりません。正しいコードを入力してください。')
    }
  }

  const handleRegister = async () => {
    if (!companyName.trim()) {
      setError('会社名（または屋号）を入力してください')
      return
    }
    setLoading(true)
    setError('')
    const result = await registerCompany(companyName.trim())
    setLoading(false)
    if (result) {
      setNewAccessCode(result.accessCode)
      setMode('registered')
    } else {
      setError('登録に失敗しました。もう一度お試しください。')
    }
  }

  const handleStartWithCode = () => {
    loginWithAccessCode(newAccessCode).then((company) => {
      if (company) onLogin(company)
    })
  }

  // トップ画面
  if (mode === 'top') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-navy rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">建設見積・請求書</h1>
            <p className="text-gray-500 mt-2">かんたん作成アプリ</p>
          </div>

          <button
            onClick={() => setMode('register')}
            className="w-full bg-navy text-white text-lg font-bold py-4 rounded-xl mb-4 active:bg-navy-light transition-colors"
          >
            初めての方（新規登録）
          </button>

          <button
            onClick={() => setMode('login')}
            className="w-full bg-white text-navy text-lg font-bold py-4 rounded-xl border-2 border-navy active:bg-gray-100 transition-colors"
          >
            アクセスコードでログイン
          </button>
        </div>
      </div>
    )
  }

  // ログイン画面
  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <button
            onClick={() => { setMode('top'); setError('') }}
            className="text-navy mb-6 flex items-center text-lg"
          >
            <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            戻る
          </button>

          <h2 className="text-xl font-bold text-gray-900 mb-6">アクセスコードを入力</h2>

          <input
            type="text"
            autoCapitalize="characters"
            maxLength={12}
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase())}
            placeholder="アクセスコード"
            className="w-full text-center text-2xl tracking-[0.2em] py-4 border-2 border-gray-300 rounded-xl focus:border-navy focus:outline-none mb-4 font-mono"
          />

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-navy text-white text-lg font-bold py-4 rounded-xl active:bg-navy-light transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Spinner className="border-white border-t-transparent" /> : 'ログイン'}
          </button>
        </div>
      </div>
    )
  }

  // 新規登録画面
  if (mode === 'register') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <button
            onClick={() => { setMode('top'); setError('') }}
            className="text-navy mb-6 flex items-center text-lg"
          >
            <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            戻る
          </button>

          <h2 className="text-xl font-bold text-gray-900 mb-2">新規登録</h2>
          <p className="text-gray-500 mb-6">会社名（または屋号）を入力してください</p>

          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="例：山田建設"
            className="w-full text-lg py-4 px-4 border-2 border-gray-300 rounded-xl focus:border-navy focus:outline-none mb-4"
          />

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-navy text-white text-lg font-bold py-4 rounded-xl active:bg-navy-light transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Spinner className="border-white border-t-transparent" /> : '登録する'}
          </button>
        </div>
      </div>
    )
  }

  // アクセスコード発行完了画面
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">登録完了！</h2>
        <p className="text-gray-500 mb-6">
          次回ログイン用のアクセスコードです。<br />
          <span className="text-red-500 font-bold">必ずメモしてください。</span>
        </p>

        <div className="bg-white border-2 border-navy rounded-xl p-6 mb-6">
          <p className="text-sm text-gray-500 mb-2">あなたのアクセスコード</p>
          <p className="text-4xl font-bold tracking-[0.3em] text-navy">{newAccessCode}</p>
        </div>

        <p className="text-sm text-gray-400 mb-6">
          このコードはブラウザにも保存されます。<br />
          別の端末からログインする場合に必要です。
        </p>

        <button
          onClick={handleStartWithCode}
          className="w-full bg-navy text-white text-lg font-bold py-4 rounded-xl active:bg-navy-light transition-colors"
        >
          はじめる
        </button>
      </div>
    </div>
  )
}
