import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Company, DocumentItem } from '../lib/types'
import { supabase } from '../lib/supabase'
import { formatCurrency, toDateInputValue, addDays, UNITS } from '../lib/utils'
import { sanitizeText } from '../lib/validation'
import Spinner from '../components/Spinner'
import PdfPreview from '../components/PdfPreview'

interface Props {
  company: Company
}

function emptyItem(sortOrder: number): DocumentItem {
  return {
    sort_order: sortOrder,
    item_name: '',
    quantity: 1,
    unit: '式',
    unit_price: 0,
    amount: 0,
  }
}

export default function DocumentEditPage({ company }: Props) {
  const navigate = useNavigate()
  const { docType, id } = useParams<{ docType?: string; id?: string }>()
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [clients, setClients] = useState<string[]>([])
  const [showClientList, setShowClientList] = useState(false)

  const today = toDateInputValue(new Date())

  const [form, setForm] = useState({
    doc_type: (docType || 'estimate') as 'estimate' | 'invoice',
    doc_number: '',
    client_name: '',
    project_name: '',
    project_location: '',
    issue_date: today,
    expiry_date: toDateInputValue(addDays(new Date(), 30)),
    payment_due: '',
    notes: '',
  })

  const [items, setItems] = useState<DocumentItem[]>([emptyItem(0)])
  const [existingDocId, setExistingDocId] = useState<string | null>(id || null)

  // 小計・税・合計の計算
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const tax = Math.floor(subtotal * 0.1)
  const total = subtotal + tax

  // 自動採番
  useEffect(() => {
    if (id) return // 編集時はスキップ
    const fetchNextNumber = async () => {
      const prefix = form.doc_type === 'estimate' ? 'EST' : 'INV'
      const { data } = await supabase
        .from('documents')
        .select('doc_number')
        .eq('company_id', company.id)
        .eq('doc_type', form.doc_type)
        .order('created_at', { ascending: false })
        .limit(1)

      let nextNum = 1
      if (data && data.length > 0) {
        const match = data[0].doc_number.match(/(\d+)$/)
        if (match) nextNum = parseInt(match[1]) + 1
      }
      setForm((prev) => ({ ...prev, doc_number: `${prefix}-${String(nextNum).padStart(3, '0')}` }))
    }
    fetchNextNumber()
  }, [company.id, form.doc_type, id])

  // 顧客リスト取得
  useEffect(() => {
    const fetchClients = async () => {
      const { data } = await supabase
        .from('clients')
        .select('client_name')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })

      if (data) setClients(data.map((c) => c.client_name))
    }
    fetchClients()
  }, [company.id])

  // 既存書類の読み込み
  useEffect(() => {
    if (!id) return
    const fetchDocument = async () => {
      const { data: doc } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .eq('company_id', company.id)
        .single()

      if (!doc) {
        navigate('/')
        return
      }

      setForm({
        doc_type: doc.doc_type,
        doc_number: doc.doc_number,
        client_name: doc.client_name,
        project_name: doc.project_name || '',
        project_location: doc.project_location || '',
        issue_date: doc.issue_date,
        expiry_date: doc.expiry_date || '',
        payment_due: doc.payment_due || '',
        notes: doc.notes || '',
      })

      const { data: docItems } = await supabase
        .from('document_items')
        .select('*')
        .eq('document_id', id)
        .order('sort_order')

      if (docItems && docItems.length > 0) {
        setItems(docItems)
      }
      setLoading(false)
    }
    fetchDocument()
  }, [id, navigate])

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleItemChange = useCallback((index: number, field: keyof DocumentItem, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev]
      const item = { ...updated[index] }

      if (field === 'quantity') {
        item.quantity = Number(value) || 0
      } else if (field === 'unit_price') {
        item.unit_price = Number(value) || 0
      } else if (field === 'item_name' || field === 'unit') {
        (item as Record<string, unknown>)[field] = value
      }

      item.amount = Math.floor(item.quantity * item.unit_price)
      updated[index] = item
      return updated
    })
  }, [])

  const addItem = () => {
    setItems((prev) => [...prev, emptyItem(prev.length)])
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems((prev) => prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, sort_order: i })))
  }

  const handleSave = async () => {
    if (!form.client_name.trim()) {
      setMessage('宛先（会社名）を入力してください')
      return
    }
    if (items.every((item) => !item.item_name.trim())) {
      setMessage('明細を1行以上入力してください')
      return
    }

    setSaving(true)
    setMessage('')

    const docData = {
      company_id: company.id,
      doc_type: form.doc_type,
      doc_number: sanitizeText(form.doc_number, 50),
      client_name: sanitizeText(form.client_name, 100),
      project_name: sanitizeText(form.project_name, 200) || null,
      project_location: sanitizeText(form.project_location, 200) || null,
      issue_date: form.issue_date,
      expiry_date: form.doc_type === 'estimate' ? form.expiry_date || null : null,
      payment_due: form.doc_type === 'invoice' ? form.payment_due || null : null,
      subtotal,
      tax,
      total,
      notes: sanitizeText(form.notes, 2000) || null,
    }

    let docId = existingDocId

    if (docId) {
      // 更新
      const { error } = await supabase.from('documents').update(docData).eq('id', docId).eq('company_id', company.id)
      if (error) {
        setMessage('保存に失敗しました')
        setSaving(false)
        return
      }
      // 既存明細を削除して再挿入
      await supabase.from('document_items').delete().eq('document_id', docId)
    } else {
      // 新規作成
      const { data, error } = await supabase.from('documents').insert(docData).select().single()
      if (error || !data) {
        setMessage('保存に失敗しました')
        setSaving(false)
        return
      }
      docId = data.id
      setExistingDocId(docId)
    }

    // 明細挿入
    const validItems = items.filter((item) => item.item_name.trim())
    if (validItems.length > 0) {
      await supabase.from('document_items').insert(
        validItems.map((item, i) => ({
          document_id: docId,
          sort_order: i,
          item_name: item.item_name,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          amount: item.amount,
        }))
      )
    }

    // 顧客名を保存（重複チェック）
    if (!clients.includes(form.client_name.trim())) {
      await supabase.from('clients').insert({
        company_id: company.id,
        client_name: form.client_name.trim(),
      })
      setClients((prev) => [form.client_name.trim(), ...prev])
    }

    setSaving(false)
    setMessage('保存しました')
    setTimeout(() => setMessage(''), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (showPreview) {
    return (
      <PdfPreview
        company={company}
        form={form}
        items={items.filter((item) => item.item_name.trim())}
        subtotal={subtotal}
        tax={tax}
        total={total}
        onClose={() => setShowPreview(false)}
      />
    )
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
          <h1 className="text-lg font-bold">
            {form.doc_type === 'estimate' ? '見積書作成' : '請求書作成'}
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 pb-32">
        <div className="space-y-4">
          {/* 書類番号 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">書類番号</label>
            <input
              type="text"
              value={form.doc_number}
              onChange={(e) => handleFormChange('doc_number', e.target.value)}
              className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:border-navy focus:outline-none text-base bg-gray-50"
            />
          </div>

          {/* 宛先 */}
          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              宛先（会社名）<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.client_name}
              onChange={(e) => handleFormChange('client_name', e.target.value)}
              onFocus={() => clients.length > 0 && setShowClientList(true)}
              onBlur={() => setTimeout(() => setShowClientList(false), 200)}
              placeholder="例：○○株式会社"
              className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:border-navy focus:outline-none text-base"
            />
            {showClientList && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-xl mt-1 shadow-lg z-20 max-h-40 overflow-y-auto">
                {clients
                  .filter((c) => c.includes(form.client_name))
                  .map((client, i) => (
                    <button
                      key={i}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        handleFormChange('client_name', client)
                        setShowClientList(false)
                      }}
                      className="w-full text-left py-3 px-4 hover:bg-gray-50 active:bg-gray-100 border-b border-gray-100 last:border-b-0"
                    >
                      {client}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* 発行日 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">発行日</label>
            <input
              type="date"
              value={form.issue_date}
              onChange={(e) => handleFormChange('issue_date', e.target.value)}
              className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:border-navy focus:outline-none text-base"
            />
          </div>

          {/* 有効期限 or 支払期限 */}
          {form.doc_type === 'estimate' ? (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">有効期限</label>
              <input
                type="date"
                value={form.expiry_date}
                onChange={(e) => handleFormChange('expiry_date', e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:border-navy focus:outline-none text-base"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">お支払期限</label>
              <input
                type="date"
                value={form.payment_due}
                onChange={(e) => handleFormChange('payment_due', e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:border-navy focus:outline-none text-base"
              />
            </div>
          )}

          {/* 工事名 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">工事名</label>
            <input
              type="text"
              value={form.project_name}
              onChange={(e) => handleFormChange('project_name', e.target.value)}
              placeholder="例：○○邸新築工事"
              className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:border-navy focus:outline-none text-base"
            />
          </div>

          {/* 工事場所 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">工事場所</label>
            <input
              type="text"
              value={form.project_location}
              onChange={(e) => handleFormChange('project_location', e.target.value)}
              placeholder="例：静岡市葵区○○"
              className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:border-navy focus:outline-none text-base"
            />
          </div>

          {/* 明細 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">明細</label>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-400 active:text-red-600 p-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={item.item_name}
                    onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                    placeholder="項目名"
                    className="w-full py-2 px-3 border border-gray-200 rounded-lg focus:border-navy focus:outline-none text-base mb-2"
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">数量</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={item.quantity || ''}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full py-2 px-3 border border-gray-200 rounded-lg focus:border-navy focus:outline-none text-base text-right"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">単位</label>
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="w-full py-2 px-2 border border-gray-200 rounded-lg focus:border-navy focus:outline-none text-base bg-white"
                      >
                        {UNITS.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">単価</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={item.unit_price || ''}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value.replace(/,/g, ''))}
                        className="w-full py-2 px-3 border border-gray-200 rounded-lg focus:border-navy focus:outline-none text-base text-right"
                      />
                    </div>
                  </div>

                  <div className="text-right mt-2 text-sm font-bold text-navy">
                    金額: ¥{formatCurrency(item.amount)}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addItem}
              className="w-full mt-3 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold active:border-navy active:text-navy transition-colors"
            >
              + 行を追加
            </button>
          </div>

          {/* 合計エリア */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between py-2 text-base">
              <span className="text-gray-600">小計</span>
              <span>¥{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 text-base border-b border-gray-200">
              <span className="text-gray-600">消費税（10%）</span>
              <span>¥{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between py-3 text-xl font-bold text-navy">
              <span>合計（税込）</span>
              <span>¥{formatCurrency(total)}</span>
            </div>
          </div>

          {/* 備考 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">備考</label>
            <textarea
              value={form.notes}
              onChange={(e) => handleFormChange('notes', e.target.value)}
              placeholder="備考事項があれば入力"
              rows={3}
              className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:border-navy focus:outline-none text-base resize-none"
            />
          </div>
        </div>

        {/* メッセージ */}
        {message && (
          <div className={`mt-4 p-3 rounded-xl text-center text-sm font-bold ${
            message.includes('失敗') || message.includes('入力') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
          }`}>
            {message}
          </div>
        )}
      </main>

      {/* フッター固定ボタン */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-lg mx-auto flex gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="flex-1 bg-white text-navy border-2 border-navy font-bold py-3 rounded-xl active:bg-gray-50 transition-colors"
          >
            プレビュー
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-navy text-white font-bold py-3 rounded-xl active:bg-navy-light transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {saving ? <Spinner className="border-white border-t-transparent" /> : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
