import { supabase } from './supabase'
import type { Company } from './types'

const STORAGE_KEY = 'kensetu_access_code'
const SESSION_EXPIRY_HOURS = 72
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15
const LOCKOUT_KEY = 'kensetu_lockout'
const ATTEMPTS_KEY = 'kensetu_attempts'

export function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const array = new Uint8Array(12)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => chars[byte % chars.length]).join('')
}

export function getSavedAccessCode(): string | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null
  try {
    const { code, expiresAt } = JSON.parse(stored)
    if (Date.now() > expiresAt) {
      clearAccessCode()
      return null
    }
    return code
  } catch {
    clearAccessCode()
    return null
  }
}

export function saveAccessCode(code: string): void {
  const expiresAt = Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ code, expiresAt }))
}

export function clearAccessCode(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function checkRateLimit(): { allowed: boolean; remainingSeconds: number } {
  const lockoutUntil = localStorage.getItem(LOCKOUT_KEY)
  if (lockoutUntil) {
    const remaining = parseInt(lockoutUntil) - Date.now()
    if (remaining > 0) {
      return { allowed: false, remainingSeconds: Math.ceil(remaining / 1000) }
    }
    localStorage.removeItem(LOCKOUT_KEY)
    localStorage.removeItem(ATTEMPTS_KEY)
  }
  return { allowed: true, remainingSeconds: 0 }
}

export function recordLoginAttempt(): boolean {
  const attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0') + 1
  localStorage.setItem(ATTEMPTS_KEY, String(attempts))

  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    const lockoutUntil = Date.now() + LOCKOUT_MINUTES * 60 * 1000
    localStorage.setItem(LOCKOUT_KEY, String(lockoutUntil))
    localStorage.removeItem(ATTEMPTS_KEY)
    return false
  }
  return true
}

export function clearLoginAttempts(): void {
  localStorage.removeItem(ATTEMPTS_KEY)
  localStorage.removeItem(LOCKOUT_KEY)
}

export async function loginWithAccessCode(accessCode: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('access_code', accessCode)
    .single()

  if (error || !data) return null
  saveAccessCode(accessCode)
  clearLoginAttempts()
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
    if (error?.code === '23505') {
      return registerCompany(companyName)
    }
    return null
  }

  saveAccessCode(accessCode)
  return { company: data as Company, accessCode }
}
