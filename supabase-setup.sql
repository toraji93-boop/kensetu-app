-- 建設業見積・請求書アプリ テーブル作成SQL

-- companies テーブル
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  access_code TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  postal_code TEXT,
  address TEXT,
  phone TEXT,
  fax TEXT,
  bank_info TEXT,
  invoice_number TEXT,
  logo_url TEXT,
  seal_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- documents テーブル
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('estimate', 'invoice')),
  doc_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  project_name TEXT,
  project_location TEXT,
  issue_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  payment_due DATE,
  subtotal INTEGER DEFAULT 0,
  tax INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  notes TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- document_items テーブル
CREATE TABLE IF NOT EXISTS document_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  item_name TEXT NOT NULL,
  quantity DECIMAL DEFAULT 1,
  unit TEXT DEFAULT '式',
  unit_price INTEGER DEFAULT 0,
  amount INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- clients テーブル（よく使う顧客の保存用）
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS有効化
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- RLSポリシー（アプリ側でcompany_idフィルタリングを実施）
CREATE POLICY "companies_select" ON companies FOR SELECT USING (true);
CREATE POLICY "companies_insert" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "companies_update" ON companies FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "documents_select" ON documents FOR SELECT USING (true);
CREATE POLICY "documents_insert" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "documents_update" ON documents FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "documents_delete" ON documents FOR DELETE USING (true);

CREATE POLICY "document_items_select" ON document_items FOR SELECT USING (true);
CREATE POLICY "document_items_insert" ON document_items FOR INSERT WITH CHECK (true);
CREATE POLICY "document_items_update" ON document_items FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "document_items_delete" ON document_items FOR DELETE USING (true);

CREATE POLICY "clients_select" ON clients FOR SELECT USING (true);
CREATE POLICY "clients_insert" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "clients_delete" ON clients FOR DELETE USING (true);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('company-images', 'company-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "storage_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'company-images');
CREATE POLICY "storage_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'company-images');
CREATE POLICY "storage_update" ON storage.objects FOR UPDATE USING (bucket_id = 'company-images');
CREATE POLICY "storage_delete" ON storage.objects FOR DELETE USING (bucket_id = 'company-images');
