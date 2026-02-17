import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import type { Company, DocumentItem } from '../lib/types'
import { formatCurrency, formatDate } from '../lib/utils'
import Spinner from './Spinner'

interface Props {
  company: Company
  form: {
    doc_type: 'estimate' | 'invoice'
    doc_number: string
    client_name: string
    project_name: string
    project_location: string
    issue_date: string
    expiry_date: string
    payment_due: string
    notes: string
  }
  items: DocumentItem[]
  subtotal: number
  tax: number
  total: number
  onClose: () => void
}

export default function PdfPreview({ company, form, items, subtotal, tax, total, onClose }: Props) {
  const pdfRef = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState(false)
  const isEstimate = form.doc_type === 'estimate'
  const title = isEstimate ? '御 見 積 書' : '御 請 求 書'

  const handleDownload = async () => {
    if (!pdfRef.current) return
    setGenerating(true)

    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${form.doc_number}_${form.client_name}.pdf`)
    } catch {
      alert('PDF生成に失敗しました。もう一度お試しください。')
    }

    setGenerating(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-navy text-white px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-white active:opacity-70"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            編集に戻る
          </button>
          <button
            onClick={handleDownload}
            disabled={generating}
            className="bg-white text-navy font-bold px-4 py-2 rounded-lg active:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
          >
            {generating ? (
              <Spinner className="w-5 h-5 border-navy border-t-transparent" />
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                PDF保存
              </>
            )}
          </button>
        </div>
      </header>

      {/* PDF内容 */}
      <div className="overflow-x-auto p-4">
        <div className="min-w-[600px] max-w-[800px] mx-auto">
          <div
            ref={pdfRef}
            className="bg-white shadow-lg"
            style={{
              width: '794px',
              minHeight: '1123px',
              padding: '50px',
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: '12px',
              color: '#111827',
            }}
          >
            {/* タイトル */}
            <h1
              style={{
                textAlign: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                letterSpacing: '0.5em',
                marginBottom: '30px',
                borderBottom: '3px double #1B365D',
                paddingBottom: '15px',
                color: '#1B365D',
              }}
            >
              {title}
            </h1>

            {/* 上部レイアウト */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              {/* 左: 宛先 */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    borderBottom: '1px solid #111827',
                    paddingBottom: '5px',
                    marginBottom: '10px',
                    display: 'inline-block',
                  }}
                >
                  {form.client_name}　御中
                </div>
                <p style={{ marginTop: '15px', fontSize: '13px' }}>
                  下記の通り{isEstimate ? 'お見積もり' : 'ご請求'}申し上げます。
                </p>
              </div>

              {/* 右: 書類情報 */}
              <div style={{ textAlign: 'right', fontSize: '12px', lineHeight: '1.8' }}>
                <p>{isEstimate ? '見積番号' : '請求番号'}: {form.doc_number}</p>
                <p>発行日: {formatDate(form.issue_date)}</p>
                {isEstimate && form.expiry_date && (
                  <p>有効期限: {formatDate(form.expiry_date)}</p>
                )}
                {!isEstimate && form.payment_due && (
                  <p>お支払期限: {formatDate(form.payment_due)}</p>
                )}
              </div>
            </div>

            {/* 合計金額 */}
            <div
              style={{
                background: '#f0f4f8',
                border: '2px solid #1B365D',
                borderRadius: '8px',
                padding: '15px 20px',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '14px', color: '#4b5563' }}>合計金額（税込）</span>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1B365D', letterSpacing: '0.05em' }}>
                ¥{formatCurrency(total)}-
              </div>
            </div>

            {/* 工事情報 */}
            {(form.project_name || form.project_location) && (
              <div style={{ marginBottom: '15px', fontSize: '13px', lineHeight: '1.8' }}>
                {form.project_name && <p>工事名: {form.project_name}</p>}
                {form.project_location && <p>工事場所: {form.project_location}</p>}
              </div>
            )}

            {/* 明細テーブル */}
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '20px',
                fontSize: '12px',
              }}
            >
              <thead>
                <tr style={{ background: '#1B365D', color: 'white' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'center', width: '40px' }}>No</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>項目名</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', width: '60px' }}>数量</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', width: '50px' }}>単位</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', width: '100px' }}>単価</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', width: '110px' }}>金額</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={index}
                    style={{ borderBottom: '1px solid #e5e7eb', background: index % 2 === 1 ? '#f9fafb' : 'white' }}
                  >
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{index + 1}</td>
                    <td style={{ padding: '8px 10px' }}>{item.item_name}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{item.unit}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>¥{formatCurrency(item.unit_price)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>¥{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid #1B365D' }}>
                  <td colSpan={4}></td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 'bold' }}>小計</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right' }}>¥{formatCurrency(subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={4}></td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 'bold' }}>消費税(10%)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right' }}>¥{formatCurrency(tax)}</td>
                </tr>
                <tr style={{ background: '#f0f4f8' }}>
                  <td colSpan={4}></td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', fontSize: '14px', color: '#1B365D' }}>合計</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', fontSize: '14px', color: '#1B365D' }}>¥{formatCurrency(total)}</td>
                </tr>
              </tfoot>
            </table>

            {/* 備考 */}
            {form.notes && (
              <div style={{ marginBottom: '30px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '13px' }}>備考:</p>
                <p style={{ whiteSpace: 'pre-wrap', fontSize: '12px', lineHeight: '1.8', color: '#4b5563' }}>
                  {form.notes}
                </p>
              </div>
            )}

            {/* 請求書の場合: 振込先 */}
            {!isEstimate && company.bank_info && (
              <div
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '30px',
                  background: '#fefce8',
                }}
              >
                <p style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>お振込先</p>
                <p style={{ whiteSpace: 'pre-wrap', fontSize: '12px', lineHeight: '1.8' }}>
                  {company.bank_info}
                </p>
              </div>
            )}

            {/* 発行者情報 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
              <div
                style={{
                  textAlign: 'left',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '15px 20px',
                  minWidth: '250px',
                  position: 'relative',
                }}
              >
                {company.logo_url && (
                  <img
                    src={company.logo_url}
                    alt="ロゴ"
                    style={{ height: '40px', marginBottom: '8px', objectFit: 'contain' }}
                    crossOrigin="anonymous"
                  />
                )}
                <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>
                  {company.company_name}
                </p>
                {company.postal_code && (
                  <p style={{ fontSize: '11px', lineHeight: '1.6' }}>〒{company.postal_code}</p>
                )}
                {company.address && (
                  <p style={{ fontSize: '11px', lineHeight: '1.6' }}>{company.address}</p>
                )}
                {company.phone && (
                  <p style={{ fontSize: '11px', lineHeight: '1.6' }}>TEL: {company.phone}</p>
                )}
                {company.fax && (
                  <p style={{ fontSize: '11px', lineHeight: '1.6' }}>FAX: {company.fax}</p>
                )}
                {company.invoice_number && (
                  <p style={{ fontSize: '11px', lineHeight: '1.6' }}>{company.invoice_number}</p>
                )}

                {/* 角印 */}
                {company.seal_url && (
                  <img
                    src={company.seal_url}
                    alt="角印"
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      width: '70px',
                      height: '70px',
                      objectFit: 'contain',
                      opacity: 0.85,
                    }}
                    crossOrigin="anonymous"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
