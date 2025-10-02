/**
 * Firestore 資料處理輔助工具
 * 用於安全地處理 Firestore Timestamp 和其他資料類型
 */

import { Timestamp } from 'firebase/firestore'

//* 安全地將 Firestore Timestamp 轉換為 Date
export const safeTimestampToDate = (timestamp: unknown): Date => {
  if (!timestamp) return new Date()

  // 如果已經是 Date 物件
  if (timestamp instanceof Date) return timestamp

  // 如果是 Firestore Timestamp
  if (
    timestamp &&
    typeof timestamp === 'object' &&
    timestamp !== null &&
    'toDate' in timestamp &&
    typeof (timestamp as { toDate: unknown }).toDate === 'function'
  ) {
    return (timestamp as { toDate: () => Date }).toDate()
  }

  // 如果是字串或數字，嘗試轉換
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    const date = new Date(timestamp)
    return isNaN(date.getTime()) ? new Date() : date
  }

  // 如果是包含 seconds 和 nanoseconds 的物件（序列化後的 Timestamp）
  if (
    timestamp &&
    typeof timestamp === 'object' &&
    timestamp !== null &&
    'seconds' in timestamp
  ) {
    const timestampObj = timestamp as { seconds: number; nanoseconds?: number }
    return new Date(
      timestampObj.seconds * 1000 + (timestampObj.nanoseconds || 0) / 1000000
    )
  }

  // 預設返回當前時間
  return new Date()
}

//* 安全地將 Date 轉換為 Firestore Timestamp
export const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date)
}

//* 處理 Firestore 文檔資料，確保所有時間欄位都正確轉換
export const processFirestoreDoc = <T extends Record<string, unknown>>(
  data: Record<string, unknown>,
  dateFields: string[] = ['createdAt', 'updatedAt', 'lastLoginAt']
): T => {
  const processed = { ...data }

  dateFields.forEach((field) => {
    if (processed[field]) {
      processed[field] = safeTimestampToDate(processed[field])
    }
  })

  return processed as T
}

//* 批量處理 Firestore 查詢結果
export const processFirestoreQueryResults = <T extends Record<string, unknown>>(
  querySnapshot: {
    docs: Array<{ id: string; data: () => Record<string, unknown> }>
  },
  dateFields: string[] = ['createdAt', 'updatedAt', 'lastLoginAt']
): T[] => {
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...processFirestoreDoc<T>(doc.data(), dateFields),
  }))
}

//* 檢查值是否為 Firestore Timestamp
export const isFirestoreTimestamp = (
  value: unknown
): value is { toDate: () => Date } => {
  return (
    value !== null &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: unknown }).toDate === 'function'
  )
}

//* 檢查值是否為序列化的 Timestamp（包含 seconds 和 nanoseconds）
export const isSerializedTimestamp = (
  value: unknown
): value is { seconds: number; nanoseconds?: number } => {
  return (
    value !== null &&
    typeof value === 'object' &&
    'seconds' in value &&
    typeof (value as { seconds: unknown }).seconds === 'number'
  )
}

//* 深度處理物件中的所有 Timestamp
export const deepProcessTimestamps = <T>(obj: T): T => {
  if (obj === null || obj === undefined) return obj

  if (Array.isArray(obj)) {
    return obj.map((item) => deepProcessTimestamps(item)) as unknown as T
  }

  if (typeof obj === 'object') {
    // 檢查是否為 Timestamp
    if (isFirestoreTimestamp(obj) || isSerializedTimestamp(obj)) {
      return safeTimestampToDate(obj) as unknown as T
    }

    // 遞迴處理物件屬性
    const processed = {} as Record<string, unknown>
    for (const [key, value] of Object.entries(obj)) {
      processed[key] = deepProcessTimestamps(value)
    }
    return processed as T
  }

  return obj
}

//* 為 Next.js 序列化準備資料
export const prepareForSerialization = <T>(data: T): T => {
  return deepProcessTimestamps(data)
}

//* 驗證資料是否可以安全序列化
export const validateSerializability = (
  data: unknown,
  path: string = 'root'
): string[] => {
  const errors: string[] = []

  if (data === null || data === undefined) return errors

  if (typeof data === 'function') {
    errors.push(`${path}: 包含函數`)
    return errors
  }

  if (data instanceof Date) {
    errors.push(`${path}: 包含 Date 物件`)
    return errors
  }

  if (isFirestoreTimestamp(data)) {
    errors.push(`${path}: 包含 Firestore Timestamp`)
    return errors
  }

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      errors.push(...validateSerializability(item, `${path}[${index}]`))
    })
    return errors
  }

  if (typeof data === 'object') {
    for (const [key, value] of Object.entries(data)) {
      errors.push(...validateSerializability(value, `${path}.${key}`))
    }
  }

  return errors
}
