import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Company } from '../lib/types'

interface Props {
  company: Company
}

export default function HomePage({ company }: Props) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  // 紹介する機能
  const handleShare = async () => {
    const shareText = `見積書がスマホだけで作れるアプリ、めっちゃ便利だよ。\nインストール不要で、このリンク開くだけ👇\nhttps://mitsukuru-jp.vercel.app`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ミツクル',
          text: shareText,
        })
      } catch {
        // ユーザーがキャンセルした場合は何もしない
      }
    } else {
      // Web Share API非対応: クリップボードにコピー
      try {
        await navigator.clipboard.writeText(shareText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // フォールバック
        const textArea = document.createElement('textarea')
        textArea.value = shareText
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-navy text-white px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">{company.company_name}</h1>
            <p className="text-sm text-blue-200">ミツクル</p>
          </div>
          <button
            onClick={() => navigate('/app/settings')}
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
      <main className="max-w-lg mx-auto p-4 pt-6 flex-1 w-full">
        <div className="grid grid-cols-1 gap-4">
          {/* 見積書を作る */}
          <button
            onClick={() => navigate('/app/document/new/estimate')}
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
            onClick={() => navigate('/app/document/new/invoice')}
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
            onClick={() => navigate('/app/history')}
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

          {/* 使い方ガイド */}
          <button
            onClick={() => window.open('/guide.pdf', '_blank')}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex items-center gap-4 active:bg-gray-50 transition-colors text-left"
          >
            <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 text-2xl">
              📖
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">使い方ガイド</h2>
              <p className="text-sm text-gray-500">操作説明書を見る</p>
            </div>
          </button>

          {/* 紹介する */}
          <button
            onClick={handleShare}
            className="bg-accent/5 rounded-2xl p-6 shadow-sm border border-accent/20 flex items-center gap-4 active:bg-accent/10 transition-colors text-left"
          >
            <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-accent">紹介する</h2>
              <p className="text-sm text-gray-500">
                {copied ? 'コピーしました！' : '知り合いにLINEで教える'}
              </p>
            </div>
          </button>
        </div>
      </main>

      {/* フッター */}
      <footer className="text-center py-4 text-xs text-gray-400">
        &copy; 2025 ミツクル
      </footer>
    </div>
  )
}
