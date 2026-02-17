import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Company } from '../lib/types'
import { supabase } from '../lib/supabase'
import { clearAccessCode } from '../lib/auth'
import Spinner from '../components/Spinner'

interface Props {
  company: Company
  onUpdate: (company: Company) => void
}

export default function SettingsPage({ company, onUpdate }: Props) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    company_name: company.company_name || '',
    postal_code: company.postal_code || '',
    address: company.address || '',
    phone: company.phone || '',
    fax: company.fax || '',
    bank_info: company.bank_info || '',
    invoice_number: company.invoice_number || '',
  })
  const [logoUrl, setLogoUrl] = useState(company.logo_url || '')
  const [sealUrl, setSealUrl] = useState(company.seal_url || '')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const uploadImage = async (file: File, type: 'logo' | 'seal') => {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${company.id}/${type}.${ext}`

    const { error } = await supabase.storage
      .from('company-images')
      .upload(path, file, { upsert: true })

    if (error) {
      setMessage('画像のアップロードに失敗しました')
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('company-images')
      .getPublicUrl(path)

    const url = urlData.publicUrl + '?t=' + Date.now()
    if (type === 'logo') setLogoUrl(url)
    else setSealUrl(url)
    setUploading(false)
  }

  const handleSave = async () => {
    if (!form.company_name.trim()) {
      setMessage('会社名は必須です')
      return
    }
    setSaving(true)
    setMessage('')

    const { data, error } = await supabase
      .from('companies')
      .update({
        ...form,
        logo_url: logoUrl || null,
        seal_url: sealUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', company.id)
      .select()
      .single()

    setSaving(false)
    if (error) {
      setMessage('保存に失敗しました。もう一度お試しください。')
    } else {
      onUpdate(data as Company)
      setMessage('保存しました')
      setTimeout(() => setMessage(''), 2000)
    }
  }

  const handleLogout = () => {
    clearAccessCode()
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-navy text-white px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 flex items-center justify-center rounded-lg active:bg-white/10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">会社情報設定</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 pb-24">
        {/* アクセスコード表示 */}
        <div className="bg-blue/5 border border-blue/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-500">あなたのアクセスコード</p>
          <p className="text-2xl font-bold tracking-[0.2em] text-navy">{company.access_code}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              会社名（屋号）<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
              className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:border-navy focus:outline-none text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">郵便番号</label>
            <input
              type="text"
              value={form.postal_code}
              onChange={(e) => handleChange('postal_code', e.target.value)}
              placeholder="例：420-0000"
              className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:border-navy focus:outline-none text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">住所</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="例：静岡市葵区○○町1-2-3"
              className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:border-navy focus:outline-none text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">電話番号</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="054-xxx-xxxx"
                className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:border-navy focus:outline-none text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">FAX番号</label>
              <input
                type="tel"
                value={form.fax}
                onChange={(e) => handleChange('fax', e.target.value)}
                placeholder="054-xxx-xxxx"
                className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:border-navy focus:outline-none text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">振込先銀行情報</label>
            <textarea
              value={form.bank_info}
              onChange={(e) => handleChange('bank_info', e.target.value)}
              placeholder={"例：\n○○銀行 ○○支店\n普通 1234567\n口座名義 ヤマダケンセツ"}
              rows={4}
              className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:border-navy focus:outline-none text-base resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">インボイス登録番号</label>
            <input
              type="text"
              value={form.invoice_number}
              onChange={(e) => handleChange('invoice_number', e.target.value)}
              placeholder="T1234567890123"
              className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:border-navy focus:outline-none text-base"
            />
          </div>

          {/* ロゴアップロード */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">ロゴ画像</label>
            {logoUrl && (
              <div className="mb-2 p-2 bg-white border border-gray-200 rounded-xl inline-block">
                <img src={logoUrl} alt="ロゴ" className="h-16 object-contain" />
              </div>
            )}
            <label className="block w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-center text-gray-500 active:border-navy cursor-pointer">
              {uploading ? '読み込み中...' : 'タップして画像を選択'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) uploadImage(file, 'logo')
                }}
              />
            </label>
          </div>

          {/* 角印アップロード */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">角印（ハンコ）画像</label>
            {sealUrl && (
              <div className="mb-2 p-2 bg-white border border-gray-200 rounded-xl inline-block">
                <img src={sealUrl} alt="角印" className="h-16 object-contain" />
              </div>
            )}
            <label className="block w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-center text-gray-500 active:border-navy cursor-pointer">
              {uploading ? '読み込み中...' : 'タップして画像を選択'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) uploadImage(file, 'seal')
                }}
              />
            </label>
          </div>
        </div>

        {/* メッセージ */}
        {message && (
          <div className={`mt-4 p-3 rounded-xl text-center text-sm font-bold ${
            message.includes('失敗') || message.includes('必須')
              ? 'bg-red-50 text-red-600'
              : 'bg-green-50 text-green-600'
          }`}>
            {message}
          </div>
        )}

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-6 bg-navy text-white text-lg font-bold py-4 rounded-xl active:bg-navy-light transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {saving ? <Spinner className="border-white border-t-transparent" /> : '保存する'}
        </button>

        {/* ログアウト */}
        <button
          onClick={handleLogout}
          className="w-full mt-4 text-red-500 text-sm py-3"
        >
          ログアウト
        </button>
      </main>
    </div>
  )
}
