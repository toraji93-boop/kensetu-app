interface Props {
  onClose: () => void
}

export default function UpgradeModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
        {/* アイコン */}
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">今月の無料枠を使い切りました</h2>
        </div>

        {/* 説明 */}
        <p className="text-sm text-gray-600 text-center mb-6">
          無料プランでは月5件まで作成できます。<br />
          プロプランに登録すると無制限に作成できます。
        </p>

        {/* プラン情報 */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-baseline justify-between">
            <span className="font-bold text-gray-900">プロプラン</span>
            <div>
              <span className="text-2xl font-bold text-accent">¥480</span>
              <span className="text-sm text-gray-500">/月</span>
            </div>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              見積書・請求書を無制限に作成
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              優先サポート
            </li>
          </ul>
        </div>

        {/* ボタン */}
        <div className="space-y-3">
          <a
            href="#"
            className="block w-full bg-accent text-white font-bold text-center py-3 rounded-xl active:bg-accent-hover transition-colors"
          >
            プロプランに登録する
          </a>
          <button
            onClick={onClose}
            className="block w-full text-gray-500 text-sm text-center py-2 active:text-gray-700 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
