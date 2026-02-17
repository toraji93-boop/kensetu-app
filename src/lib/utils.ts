export function formatCurrency(value: number): string {
  return value.toLocaleString('ja-JP')
}

export function formatDate(date: string): string {
  const d = new Date(date)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

export function toDateInputValue(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const UNITS = ['式', '個', 'm', 'm²', 'm³', '人工', '台', '本', '箇所', '一式', 'kg', 't', 'セット'] as const
