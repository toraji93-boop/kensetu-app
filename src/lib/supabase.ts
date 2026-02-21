import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase環境変数が設定されていません。.envファイルを確認してください。')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 今月の書類作成数を取得
export async function getMonthlyDocumentCount(companyId: string): Promise<number> {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

  const { count, error } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .gte('created_at', firstDay)
    .lt('created_at', nextMonth)

  if (error) {
    console.error('月間作成数の取得に失敗:', error)
    return 0
  }

  return count ?? 0
}
