import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { storage } from './firebase'

/**
 * 為 Promise 加入 timeout，逾時則 reject
 * 同時回傳 cancel 函式以便外部在 Promise 提前完成時取消計時器
 * @param {Promise<T>} promise - 操作
 * @param {number} ms - 逾時時間
 * @param {string} label - 操作標籤
 * @returns {Promise<T>} 操作結果
 */
function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label = '操作',
): Promise<T> {
  // 設定逾時計時器
  let timerId: ReturnType<typeof setTimeout>
  // 設定逾時 Promise
  const timeout = new Promise<never>((_, reject) => {
    timerId = setTimeout(
      () =>
        reject(
          new Error(`${label}逾時（超過 ${ms / 1000} 秒），請檢查網路後重試`),
        ),
      ms,
    )
  })
  return Promise.race([promise.finally(() => clearTimeout(timerId)), timeout])
}

/**
 * 上傳圖片到 Firebase Storage
 * @param {File} image - 圖片檔案
 * @param {string} announcementId - 公告 ID
 * @returns {Promise<string>} 圖片下載 URL
 */
export const uploadImageToFirebaseStorage = async (
  image: File,
  announcementId: string,
): Promise<string> => {
  try {
    // 生成唯一的檔案名稱，避免重複
    const timestamp = new Date().getTime()
    const fileName = `${timestamp}_${image.name}`

    // 建立 storage reference
    const storageRef = ref(
      storage,
      `announcements/${announcementId}/${fileName}`,
    )

    // 上傳檔案
    const snapshot = await uploadBytes(storageRef, image)

    // 獲取下載 URL
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
  } catch (error) {
    console.error('上傳圖片到 Firebase Storage 失敗:', error)
    throw error
  }
}

/**
 * 批量上傳多張圖片到 Firebase Storage
 * @param {File[]} images - 圖片檔案列表
 * @param {string} announcementId - 公告 ID
 * @returns {Promise<string[]>} 圖片下載 URL 列表
 */
export const uploadImages = async (
  images: File[],
  announcementId: string,
): Promise<string[]> => {
  try {
    if (!images || images.length === 0) {
      // 如果圖片列表為空，則返回空陣列
      return []
    }

    // 建立上傳 Promise 列表
    const uploadPromises = images.map((image) =>
      uploadImageToFirebaseStorage(image, announcementId),
    )

    // 等待所有上傳完成
    const downloadURLs = await Promise.all(uploadPromises)

    return downloadURLs
  } catch (error) {
    console.error('批量上傳圖片失敗:', error)
    throw error
  }
}

/**
 * 上傳註冊頭像到 Firebase Storage（專用路徑）
 * @param {File} image - 圖片檔案
 * @param {string} ownerId - 使用者 ID
 * @returns {Promise<string>} 圖片下載 URL
 */
export const uploadUserAvatarToFirebaseStorage = async (
  image: File,
  ownerId: string,
): Promise<string> => {
  try {
    // 生成唯一的檔案名稱，避免重複
    const now = new Date()
    // 獲取年份
    const year = now.getFullYear()
    // 獲取月份
    const month = String(now.getMonth() + 1).padStart(2, '0')
    // 獲取安全的使用者 ID
    const safeOwnerId = ownerId
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9@._-]/g, '_')
    // 獲取圖片副檔名
    const extension = image.name.includes('.')
      ? image.name.split('.').pop()?.toLowerCase()
      : 'jpg'
    // 生成唯一的 ID
    const uniqueId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    // 生成唯一的檔案名稱
    const fileName = `${Date.now()}-${uniqueId}.${extension || 'jpg'}`

    // 建立 storage reference
    const storageRef = ref(
      storage,
      `users/avatars/${year}/${month}/${safeOwnerId}/${fileName}`,
    )

    // 上傳檔案
    const snapshot = await uploadBytes(storageRef, image)
    // 取得下載 URL
    try {
      return await withTimeout(
        getDownloadURL(snapshot.ref),
        15000,
        '取得頭像下載網址',
      )
    } catch (err) {
      // 取得 URL 失敗時刪除剛上傳的孤立檔案，避免佔用儲存空間
      deleteObject(snapshot.ref).catch(() => {})
      throw err
    }
  } catch (error) {
    console.error('上傳使用者頭像到 Firebase Storage 失敗:', error)
    throw error
  }
}

/**
 * 上傳個人背景到 Firebase Storage（專用路徑）
 * @param {File} image - 圖片檔案
 * @param {string} ownerId - 使用者 ID
 * @returns {Promise<string>} 圖片下載 URL
 */
export const uploadUserBackgroundToFirebaseStorage = async (
  image: File,
  ownerId: string,
): Promise<string> => {
  try {
    // 生成唯一的檔案名稱，避免重複
    const now = new Date()
    // 獲取年份
    const year = now.getFullYear()
    // 獲取月份
    const month = String(now.getMonth() + 1).padStart(2, '0')
    // 獲取安全的使用者 ID
    const safeOwnerId = ownerId
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9@._-]/g, '_')
    // 獲取圖片副檔名
    const extension = image.name.includes('.')
      ? image.name.split('.').pop()?.toLowerCase()
      : 'jpg'
    // 生成唯一的 ID
    const uniqueId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    // 生成唯一的檔案名稱
    const fileName = `${Date.now()}-${uniqueId}.${extension || 'jpg'}`

    // 建立 storage reference
    const storageRef = ref(
      storage,
      `users/backgrounds/${year}/${month}/${safeOwnerId}/${fileName}`,
    )

    // 上傳檔案
    const snapshot = await uploadBytes(storageRef, image)
    // 取得下載 URL
    try {
      return await withTimeout(
        getDownloadURL(snapshot.ref),
        15000,
        '取得背景下載網址',
      )
    } catch (err) {
      // 取得 URL 失敗時刪除剛上傳的孤立檔案，避免佔用儲存空間
      deleteObject(snapshot.ref).catch(() => {})
      throw err
    }
  } catch (error) {
    console.error('上傳使用者背景到 Firebase Storage 失敗:', error)
    throw error
  }
}

/**
 * 刪除 Firebase Storage 中的圖片
 * @param {string} imageUrl - 圖片 URL
 * @returns {Promise<void>} 刪除結果
 */
export const deleteImageFromFirebaseStorage = async (
  imageUrl: string,
): Promise<void> => {
  try {
    if (!imageUrl) return // 如果圖片 URL 為空，則返回
    if (!imageUrl.includes('firebasestorage.googleapis.com')) return // 如果圖片 URL 不包含 Firebase Storage 的域名，則返回

    // 建立 storage reference
    const storageRef = ref(storage, imageUrl)
    // 刪除檔案
    await deleteObject(storageRef)
  } catch (error) {
    console.error('刪除圖片失敗:', error)
  }
}
