import { useState } from 'react'
import { Link } from 'react-router-dom'

// FAQアイテムコンポーネント
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left"
      >
        <span className="font-bold text-[#333] text-base pr-4">Q. {question}</span>
        <svg
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-5 text-[#333] text-sm leading-relaxed">
          A. {answer}
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
      {/* セクション1: ヒーロー */}
      <section className="bg-[#1B2A4A] text-white">
        <div className="max-w-3xl mx-auto px-5 py-16 md:py-24 text-center">
          <h1 className="text-3xl md:text-[40px] font-bold leading-tight mb-4">
            見積書、LINEで送るだけ。
          </h1>
          <p className="text-base md:text-lg text-blue-200 mb-8 leading-relaxed">
            スマホで作って、そのままお客様へ。<br />
            インストール不要。30秒で始められます。
          </p>
          <Link
            to="/app"
            className="inline-block bg-[#FF6B35] hover:bg-[#e55a2b] text-white text-lg font-bold px-10 py-4 rounded-xl transition-colors shadow-lg"
          >
            無料で使ってみる →
          </Link>
          <p className="mt-4 text-sm text-blue-300">
            月5件まで無料・クレジットカード不要・メールアドレス不要
          </p>
        </div>
      </section>

      {/* セクション2: かんたん3ステップ */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 py-16 md:py-20">
          <h2 className="text-2xl font-bold text-center text-[#333] mb-12">
            かんたん3ステップ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '①',
                title: '会社名を入れて登録',
                subtitle: '（30秒）',
                icon: (
                  <svg className="w-10 h-10 text-[#1B2A4A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
              },
              {
                step: '②',
                title: '金額を入力してPDF作成',
                subtitle: '',
                icon: (
                  <svg className="w-10 h-10 text-[#1B2A4A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              {
                step: '③',
                title: 'LINEでお客様に送信',
                subtitle: '',
                icon: (
                  <svg className="w-10 h-10 text-[#1B2A4A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-20 h-20 bg-[#F8F9FA] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="text-[#FF6B35] font-bold text-lg mb-1">{item.step}</div>
                <p className="font-bold text-[#333] text-base">{item.title}</p>
                {item.subtitle && <p className="text-sm text-gray-500">{item.subtitle}</p>}
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/app"
              className="inline-block bg-[#FF6B35] hover:bg-[#e55a2b] text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-lg"
            >
              今すぐ試してみる →
            </Link>
          </div>
        </div>
      </section>

      {/* セクション3: 特徴 */}
      <section className="bg-[#F8F9FA]">
        <div className="max-w-3xl mx-auto px-5 py-16 md:py-20">
          <h2 className="text-2xl font-bold text-center text-[#333] mb-12">
            選ばれる理由
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                emoji: '📱',
                title: 'インストール不要',
                desc: 'アプリのダウンロードは必要ありません。\nこのページのリンクを開くだけです。',
              },
              {
                emoji: '⚡',
                title: '登録はたった30秒',
                desc: '必要なのは会社名だけ。\nメールアドレスもパスワードも不要です。',
              },
              {
                emoji: '📄',
                title: '消費税も自動計算',
                desc: '項目と金額を入れるだけ。\n計算ミスの心配はありません。',
              },
              {
                emoji: '🏢',
                title: 'ロゴ・角印も入る',
                desc: '会社のロゴやハンコの画像を登録すれば\nきちんとした見積書が出来上がります。',
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="font-bold text-[#333] text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* セクション4: ユーザーの声 */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 py-16 md:py-20">
          <h2 className="text-2xl font-bold text-center text-[#333] mb-12">
            こんな声をいただいています
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: '現場で「見積書ちょうだい」と言われて、その場でスマホから送れるようになった',
                author: '建設業・一人親方',
              },
              {
                quote: 'パソコン持ってないけど、これならスマホだけで全部できる',
                author: '内装業・個人事業主',
              },
              {
                quote: '知り合いに紹介したら、LINEでURL送っただけで使い始めてた',
                author: 'リフォーム業',
              },
            ].map((item) => (
              <div key={item.author} className="bg-[#F8F9FA] rounded-2xl p-6">
                <p className="text-[#333] text-sm leading-relaxed mb-4">「{item.quote}」</p>
                <p className="text-gray-500 text-sm">— {item.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* セクション5: 料金プラン */}
      <section className="bg-[#F8F9FA]">
        <div className="max-w-3xl mx-auto px-5 py-16 md:py-20">
          <h2 className="text-2xl font-bold text-center text-[#333] mb-3">
            ずっと無料でも使えます
          </h2>
          <p className="text-center text-gray-500 text-sm mb-12">
            有料プランは件数が多い方向けです
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* 無料プラン */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-[#22C55E]">
              <div className="text-center mb-6">
                <span className="inline-block bg-[#22C55E] text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                  おすすめ
                </span>
                <h3 className="font-bold text-[#333] text-lg">無料プラン</h3>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-[#333]">¥0</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">月5件まで</p>
              </div>
              <ul className="space-y-3">
                {[
                  '見積書・請求書',
                  'PDF保存',
                  'ロゴ・角印',
                  'インボイス対応',
                  '履歴閲覧',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-[#333]">
                    <span className="text-[#22C55E]">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mt-4 text-center">カード登録不要</p>
            </div>

            {/* プロプラン */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="text-center mb-6">
                <span className="inline-block bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full mb-3">
                  たくさん使う方に
                </span>
                <h3 className="font-bold text-[#333] text-lg">プロプラン</h3>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-[#333]">¥480</span>
                  <span className="text-sm text-gray-500">/月（税込）</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">無制限</p>
              </div>
              <ul className="space-y-3">
                {[
                  '無料プランの全機能',
                  '作成数の制限なし',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-[#333]">
                    <span className="text-[#22C55E]">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mt-4 text-center">いつでも解約OK</p>
            </div>
          </div>
          <div className="text-center mt-10">
            <Link
              to="/app"
              className="inline-block bg-[#FF6B35] hover:bg-[#e55a2b] text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-lg"
            >
              まずは無料で始める →
            </Link>
          </div>
        </div>
      </section>

      {/* セクション6: FAQ */}
      <section className="bg-white">
        <div className="max-w-2xl mx-auto px-5 py-16 md:py-20">
          <h2 className="text-2xl font-bold text-center text-[#333] mb-12">
            よくある質問
          </h2>
          <div>
            <FaqItem
              question="本当に無料ですか？"
              answer="月5件まで完全無料です。クレジットカードの登録も不要です。"
            />
            <FaqItem
              question="スマホしか持っていませんが大丈夫ですか？"
              answer="はい。スマホのブラウザだけで全て完結します。PCは不要です。"
            />
            <FaqItem
              question="データは消えませんか？"
              answer="サーバーに安全に保存されます。スマホを変えても、6桁のアクセスコードでログインできます。"
            />
            <FaqItem
              question="どの業種でも使えますか？"
              answer="はい。建設業、内装業、リフォーム、クリーニング、フリーランスなど、見積書・請求書を出すお仕事ならどなたでもお使いいただけます。"
            />
            <FaqItem
              question="知り合いに紹介したいのですが？"
              answer="アプリ内の「紹介する」ボタンから、LINEでURLを送るだけです。相手はタップするだけで使い始められます。"
            />
            <FaqItem
              question="解約したい場合は？"
              answer="プロプランはいつでも解約できます。解約後は無料プランに戻り、月5件までそのまま使えます。"
            />
          </div>
        </div>
      </section>

      {/* セクション7: 最後のCTA */}
      <section className="bg-[#1B2A4A] text-white">
        <div className="max-w-3xl mx-auto px-5 py-16 md:py-20 text-center">
          <p className="text-xl md:text-2xl font-bold leading-relaxed mb-8">
            見積書を作るのに、<br />
            もう難しいソフトはいりません。
          </p>
          <Link
            to="/app"
            className="inline-block bg-[#FF6B35] hover:bg-[#e55a2b] text-white text-lg font-bold px-10 py-4 rounded-xl transition-colors shadow-lg"
          >
            無料で使ってみる →
          </Link>
        </div>
      </section>

      {/* セクション8: フッター */}
      <footer className="bg-[#111827] text-gray-400">
        <div className="max-w-3xl mx-auto px-5 py-8 text-center">
          <p className="font-bold text-white text-sm mb-2">
            ミツクル — スマホで見積書・請求書をかんたん作成
          </p>
          <div className="flex items-center justify-center gap-4 text-xs mb-4">
            <a href="/terms" className="hover:text-white transition-colors">利用規約</a>
            <span>|</span>
            <a href="/legal" className="hover:text-white transition-colors">特定商取引法に基づく表記</a>
            <span>|</span>
            <a href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</a>
          </div>
          <p className="text-xs">&copy; 2025 ミツクル</p>
        </div>
      </footer>
    </div>
  )
}
