export function sanitizeText(input: string, maxLength: number = 500): string {
  return input.trim().slice(0, maxLength)
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value.trim()) return `${fieldName}を入力してください`
  return null
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'JPG、PNG、WebP形式の画像のみアップロードできます'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'ファイルサイズは5MB以下にしてください'
  }
  return null
}
