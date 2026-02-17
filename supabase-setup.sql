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

-- RLSを無効化（MVPフェーズ）
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 全てのアクセスを許可するポリシー（anon key用）
CREATE POLICY "Allow all access on companies" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on documents" ON documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on document_items" ON document_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on clients" ON clients FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket for company images
INSERT INTO storage.buckets (id, name, public) VALUES ('company-images', 'company-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for public access
CREATE POLICY "Allow public read on company-images" ON storage.objects FOR SELECT USING (bucket_id = 'company-images');
CREATE POLICY "Allow public insert on company-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'company-images');
CREATE POLICY "Allow public update on company-images" ON storage.objects FOR UPDATE USING (bucket_id = 'company-images');
CREATE POLICY "Allow public delete on company-images" ON storage.objects FOR DELETE USING (bucket_id = 'company-images');
