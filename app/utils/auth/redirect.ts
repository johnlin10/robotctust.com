/**
 * [Function] 檢查是否為安全的重新導向路徑
 * 確保路徑以 / 開頭且非協定相對路徑 (//)
 * @param {string | null | undefined} path - 待檢查的路徑
 * @returns {boolean}
 */
export function isSafeRedirectPath(path: string | null | undefined): boolean {
  if (!path) return false
  return path.startsWith('/') && !path.startsWith('//')
}
