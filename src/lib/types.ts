export interface Company {
  id: string
  access_code: string
  company_name: string
  postal_code: string | null
  address: string | null
  phone: string | null
  fax: string | null
  bank_info: string | null
  invoice_number: string | null
  logo_url: string | null
  seal_url: string | null
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  company_id: string
  doc_type: 'estimate' | 'invoice'
  doc_number: string
  client_name: string
  project_name: string | null
  project_location: string | null
  issue_date: string
  expiry_date: string | null
  payment_due: string | null
  subtotal: number
  tax: number
  total: number
  notes: string | null
  pdf_url: string | null
  created_at: string
}

export interface DocumentItem {
  id?: string
  document_id?: string
  sort_order: number
  item_name: string
  quantity: number
  unit: string
  unit_price: number
  amount: number
}

export interface Client {
  id: string
  company_id: string
  client_name: string
  created_at: string
}
