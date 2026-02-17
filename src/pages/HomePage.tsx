import { useNavigate } from 'react-router-dom'
import type { Company } from '../lib/types'

interface Props {
  company: Company
}

export default function HomePage({ company }: Props) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-navy text-white px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">{company.company_name}</h1>
            <p className="text-sm text-blue-200">建設見積・請求書</p>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="w-10 h-10 flex items-center justify-center rounded-lg active:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-lg mx-auto p-4 pt-6">
        <div className="grid grid-cols-1 gap-4">
          {/* 見積書を作る */}
          <button
            onClick={() => navigate('/document/new/estimate')}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex items-center gap-4 active:bg-gray-50 transition-colors text-left"
          >
            <div className="w-14 h-14 bg-blue/10 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">見積書を作る</h2>
              <p className="text-sm text-gray-500">新しい見積書を作成します</p>
            </div>
          </button>

          {/* 請求書を作る */}
          <button
            onClick={() => navigate('/document/new/invoice')}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex items-center gap-4 active:bg-gray-50 transition-colors text-left"
          >
            <div className="w-14 h-14 bg-navy/10 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">請求書を作る</h2>
              <p className="text-sm text-gray-500">新しい請求書を作成します</p>
            </div>
          </button>

          {/* 履歴 */}
          <button
            onClick={() => navigate('/history')}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex items-center gap-4 active:bg-gray-50 transition-colors text-left"
          >
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">履歴</h2>
              <p className="text-sm text-gray-500">過去の見積書・請求書を確認</p>
            </div>
          </button>
        </div>
      </main>
    </div>
  )
}
