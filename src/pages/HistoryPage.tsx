import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Company, Document as Doc } from '../lib/types'
import { supabase } from '../lib/supabase'
import { formatCurrency, formatDate } from '../lib/utils'
import Spinner from '../components/Spinner'

interface Props {
  company: Company
}

type FilterType = 'all' | 'estimate' | 'invoice'

export default function HistoryPage({ company }: Props) {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [converting, setConverting] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocuments = async () => {
      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })

      if (data) setDocuments(data as Doc[])
      setLoading(false)
    }
    fetchDocuments()
  }, [company.id])

  const filteredDocs = documents.filter((doc) => {
    if (filter === 'all') return true
    return doc.doc_type === filter
  })

  const handleConvertToInvoice = async (doc: Doc) => {
    setConverting(doc.id)

    // 次の請求書番号を取得
    const { data: existing } = await supabase
      .from('documents')
      .select('doc_number')
      .eq('company_id', company.id)
      .eq('doc_type', 'invoice')
      .order('created_at', { ascending: false })
      .limit(1)

    let nextNum = 1
    if (existing && existing.length > 0) {
      const match = existing[0].doc_number.match(/(\d+)$/)
      if (match) nextNum = parseInt(match[1]) + 1
    }

    // 新しい請求書を作成
    const { data: newDoc, error: docError } = await supabase
      .from('documents')
      .insert({
        company_id: company.id,
        doc_type: 'invoice',
        doc_number: `INV-${String(nextNum).padStart(3, '0')}`,
        client_name: doc.client_name,
        project_name: doc.project_name,
        project_location: doc.project_location,
        issue_date: new Date().toISOString().split('T')[0],
        subtotal: doc.subtotal,
        tax: doc.tax,
        total: doc.total,
        notes: doc.notes,
      })
      .select()
      .single()

    if (docError || !newDoc) {
      alert('転用に失敗しました')
      setConverting(null)
      return
    }

    // 明細をコピー
    const { data: items } = await supabase
      .from('document_items')
      .select('*')
      .eq('document_id', doc.id)
      .order('sort_order')

    if (items && items.length > 0) {
      await supabase.from('document_items').insert(
        items.map((item) => ({
          document_id: newDoc.id,
          sort_order: item.sort_order,
          item_name: item.item_name,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          amount: item.amount,
        }))
      )
    }

    setConverting(null)
    navigate(`/document/edit/${newDoc.id}`)
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('この書類を削除しますか？')) return
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', docId)
      .eq('company_id', company.id)
    if (!error) {
      setDocuments((prev) => prev.filter((d) => d.id !== docId))
    }
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
          <h1 className="text-lg font-bold">履歴</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        {/* フィルター */}
        <div className="flex gap-2 mb-4">
          {[
            { value: 'all' as FilterType, label: 'すべて' },
            { value: 'estimate' as FilterType, label: '見積書' },
            { value: 'invoice' as FilterType, label: '請求書' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${
                filter === f.value
                  ? 'bg-navy text-white'
                  : 'bg-white text-gray-600 border border-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>書類がありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => navigate(`/document/edit/${doc.id}`)}
                  className="w-full p-4 text-left active:bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          doc.doc_type === 'estimate'
                            ? 'bg-blue/10 text-blue'
                            : 'bg-navy/10 text-navy'
                        }`}
                      >
                        {doc.doc_type === 'estimate' ? '見積' : '請求'}
                      </span>
                      <span className="text-sm font-bold text-gray-800">{doc.doc_number}</span>
                    </div>
                    <span className="text-sm text-gray-400">{formatDate(doc.issue_date)}</span>
                  </div>
                  <p className="text-base font-bold text-gray-900">{doc.client_name}</p>
                  {doc.project_name && (
                    <p className="text-sm text-gray-500 mt-0.5">{doc.project_name}</p>
                  )}
                  <p className="text-lg font-bold text-navy mt-1">
                    ¥{formatCurrency(doc.total)}
                  </p>
                </button>

                {/* アクションボタン */}
                <div className="flex border-t border-gray-100">
                  {doc.doc_type === 'estimate' && (
                    <button
                      onClick={() => handleConvertToInvoice(doc)}
                      disabled={converting === doc.id}
                      className="flex-1 py-3 text-sm font-bold text-blue border-r border-gray-100 active:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {converting === doc.id ? (
                        <Spinner className="w-4 h-4 border-blue border-t-transparent" />
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          請求書に転用
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="flex-1 py-3 text-sm font-bold text-red-400 active:bg-gray-50 flex items-center justify-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
