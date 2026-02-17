import { supabase } from './supabase'
import type { Company } from './types'

const STORAGE_KEY = 'kensetu_access_code'

export function generateAccessCode(): string {
  const chars = '0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function getSavedAccessCode(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function saveAccessCode(code: string): void {
  localStorage.setItem(STORAGE_KEY, code)
}

export function clearAccessCode(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export async function loginWithAccessCode(accessCode: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('access_code', accessCode)
    .single()

  if (error || !data) return null
  saveAccessCode(accessCode)
  return data as Company
}

export async function registerCompany(companyName: string): Promise<{ company: Company; accessCode: string } | null> {
  const accessCode = generateAccessCode()

  const { data, error } = await supabase
    .from('companies')
    .insert({
      access_code: accessCode,
      company_name: companyName,
    })
    .select()
    .single()

  if (error || !data) {
    // アクセスコードが重複した場合、リトライ
    if (error?.code === '23505') {
      return registerCompany(companyName)
    }
    return null
  }

  saveAccessCode(accessCode)
  return { company: data as Company, accessCode }
}
