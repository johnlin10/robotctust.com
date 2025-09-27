import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

/**
 * 上傳圖片到 Firebase Storage
 */
export const uploadImageToFirebaseStorage = async (
  image: File,
  announcementId: string
): Promise<string> => {
  try {
    // 生成唯一的檔案名稱，避免重複
    const timestamp = new Date().getTime()
    const fileName = `${timestamp}_${image.name}`

    const storageRef = ref(
      storage,
      `announcements/${announcementId}/${fileName}`
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
 */
export const uploadImages = async (
  images: File[],
  announcementId: string
): Promise<string[]> => {
  try {
    if (!images || images.length === 0) {
      return []
    }

    // 同時上傳所有圖片
    const uploadPromises = images.map((image) =>
      uploadImageToFirebaseStorage(image, announcementId)
    )

    const downloadURLs = await Promise.all(uploadPromises)

    console.log(`成功上傳 ${downloadURLs.length} 張圖片`)
    return downloadURLs
  } catch (error) {
    console.error('批量上傳圖片失敗:', error)
    throw error
  }
}

/**
 * 刪除 Firebase Storage 中的圖片
 * TODO: 需要實作圖片刪除功能
 */
export const deleteImageFromFirebaseStorage = async (
  imageUrl: string
): Promise<void> => {
  try {
    // TODO: 實作圖片刪除功能
    // const storageRef = ref(storage, imageUrl)
    // await deleteObject(storageRef)

    console.log('TODO: 刪除圖片功能待實作:', imageUrl)
  } catch (error) {
    console.error('刪除圖片失敗:', error)
    // 不拋出錯誤，因為圖片可能已經被刪除
  }
}
