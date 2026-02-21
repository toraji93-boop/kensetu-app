import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Company } from '../lib/types'
import { getSavedAccessCode, loginWithAccessCode } from '../lib/auth'

interface Props {
  onUpdate: (company: Company) => void
}

export default function UpgradeSuccessPage({ onUpdate }: Props) {
  const navigate = useNavigate()

  // 会社情報を再取得してプラン状態を反映
  useEffect(() => {
    const refresh = async () => {
      const code = getSavedAccessCode()
      if (code) {
        const company = await loginWithAccessCode(code)
        if (company) onUpdate(company)
      }
    }
    refresh()
  }, [onUpdate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-sm border border-gray-200 text-center">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">プロプランへの登録が完了しました</h1>
        <p className="text-sm text-gray-600 mb-6">
          見積書・請求書を無制限に作成できるようになりました。
        </p>
        <button
          onClick={() => navigate('/app')}
          className="w-full bg-navy text-white font-bold py-3 rounded-xl active:bg-navy-light transition-colors"
        >
          ホームに戻る
        </button>
      </div>
    </div>
  )
}
