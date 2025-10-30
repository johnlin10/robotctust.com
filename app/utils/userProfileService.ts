/**
 * 使用者資料編輯服務
 * 提供使用者個人資料的編輯功能
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { doc, setDoc, getDoc, deleteField } from 'firebase/firestore'
import { storage, db } from './firebase'
import { UserProfile } from '../types/user'

/**
 * 上傳使用者頭像到 Firebase Storage
 * @param uid 使用者 ID
 * @param imageFile 圖片檔案
 * @returns 下載 URL
 */
export const uploadUserAvatar = async (
  uid: string,
  imageFile: File
): Promise<string> => {
  try {
    // 驗證檔案類型
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('請選擇圖片檔案')
    }

    // 驗證檔案大小（限制 5MB）
    if (imageFile.size > 5 * 1024 * 1024) {
      throw new Error('頭像檔案大小不能超過 5MB')
    }

    // 生成唯一的檔案名稱
    const timestamp = new Date().getTime()
    const fileExtension = imageFile.name.split('.').pop() || 'jpg'
    const fileName = `avatar_${timestamp}.${fileExtension}`

    const storageRef = ref(storage, `users/${uid}/avatar/${fileName}`)

    // 上傳檔案
    const snapshot = await uploadBytes(storageRef, imageFile)

    // 獲取下載 URL
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
  } catch (error) {
    console.error('上傳使用者頭像失敗:', error)
    throw error
  }
}

/**
 * 刪除舊的頭像（如果存在）
 * @param imageUrl 圖片 URL
 */
export const deleteOldAvatar = async (imageUrl: string): Promise<void> => {
  try {
    // 只刪除 Firebase Storage 中的圖片（不是預設圖片）
    if (
      imageUrl &&
      imageUrl.startsWith('https://') &&
      !imageUrl.includes('/assets/image/')
    ) {
      // 從 URL 中提取路徑
      const url = new URL(imageUrl)
      const path = url.pathname.split('/o/')[1]?.split('?')[0]
      if (path) {
        const decodedPath = decodeURIComponent(path)
        const storageRef = ref(storage, decodedPath)
        await deleteObject(storageRef)
      }
    }
  } catch (error) {
    // 不拋出錯誤，因為圖片可能已經被刪除或不存在
    console.warn('刪除舊頭像失敗（可能已不存在）:', error)
  }
}

/**
 * 更新使用者帳號名稱
 * @param uid 使用者 ID
 * @param newUsername 新的帳號名稱
 * @param checkUnique 檢查唯一性的函數
 * @returns 更新後的資料
 */
export const updateUsername = async (
  uid: string,
  newUsername: string,
  checkUnique: (username: string) => Promise<boolean>
): Promise<void> => {
  try {
    // 驗證格式
    if (!/^[a-zA-Z0-9_.-]+$/.test(newUsername)) {
      throw new Error('帳號名稱只能包含英文字母、數字、底線、點和連字號')
    }

    if (newUsername.length < 3 || newUsername.length > 20) {
      throw new Error('帳號名稱需要 3-20 個字元')
    }

    // 檢查唯一性
    const usernameExists = await checkUnique(newUsername)
    if (usernameExists) {
      throw new Error('此帳號名稱已被使用')
    }

    // 更新 Firestore
    await setDoc(
      doc(db, 'users', uid),
      {
        username: newUsername,
        updatedAt: new Date(),
      },
      { merge: true }
    )
  } catch (error) {
    console.error('更新帳號名稱失敗:', error)
    throw error
  }
}

/**
 * 更新使用者暱稱
 * @param uid 使用者 ID
 * @param newDisplayName 新的暱稱
 */
export const updateDisplayName = async (
  uid: string,
  newDisplayName: string
): Promise<void> => {
  try {
    // 驗證長度
    if (newDisplayName.length > 15) {
      throw new Error('暱稱不能超過 15 個字元')
    }

    if (!newDisplayName.trim()) {
      throw new Error('暱稱不能為空')
    }

    // 更新 Firestore
    await setDoc(
      doc(db, 'users', uid),
      {
        displayName: newDisplayName.trim(),
        updatedAt: new Date(),
      },
      { merge: true }
    )
  } catch (error) {
    console.error('更新暱稱失敗:', error)
    throw error
  }
}

/**
 * 更新使用者個人簡介
 * @param uid 使用者 ID
 * @param newBio 新的個人簡介
 */
export const updateBio = async (
  uid: string,
  newBio: string | undefined
): Promise<void> => {
  try {
    // 如果 newBio 是空字串，則視為 undefined
    const trimmedBio = newBio?.trim() || undefined

    // 驗證長度（如果提供）
    if (trimmedBio !== undefined && trimmedBio.length > 500) {
      throw new Error('個人簡介不能超過 500 個字元')
    }

    // 更新 Firestore
    const updateData: { bio?: string; updatedAt: Date } = {
      updatedAt: new Date(),
    }

    if (trimmedBio === undefined) {
      // 如果要刪除 bio，使用 deleteField()
      updateData.bio = deleteField() as any
    } else {
      // 如果要設定 bio，使用字串值
      updateData.bio = trimmedBio
    }

    await setDoc(doc(db, 'users', uid), updateData, { merge: true })
  } catch (error) {
    console.error('更新個人簡介失敗:', error)
    throw error
  }
}

/**
 * 更新使用者頭像
 * @param uid 使用者 ID
 * @param newPhotoURL 新的頭像 URL
 * @param oldPhotoURL 舊的頭像 URL（可選，用於刪除舊圖片）
 */
export const updateAvatar = async (
  uid: string,
  newPhotoURL: string,
  oldPhotoURL?: string
): Promise<void> => {
  try {
    // 更新 Firestore
    await setDoc(
      doc(db, 'users', uid),
      {
        photoURL: newPhotoURL,
        updatedAt: new Date(),
      },
      { merge: true }
    )

    // 如果提供了舊的頭像 URL，嘗試刪除舊圖片
    if (oldPhotoURL && oldPhotoURL !== newPhotoURL) {
      await deleteOldAvatar(oldPhotoURL)
    }
  } catch (error) {
    console.error('更新頭像失敗:', error)
    throw error
  }
}

/**
 * 更新使用者個性標籤（未來擴展）
 * @param uid 使用者 ID
 * @param tags 新的標籤陣列
 */
export const updateTags = async (
  uid: string,
  tags: string[]
): Promise<void> => {
  try {
    // 驗證標籤數量（最多 10 個）
    if (tags.length > 10) {
      throw new Error('標籤數量不能超過 10 個')
    }

    // 驗證每個標籤長度（最多 20 個字元）
    for (const tag of tags) {
      if (tag.length > 20) {
        throw new Error('每個標籤長度不能超過 20 個字元')
      }
    }

    // 更新 Firestore
    await setDoc(
      doc(db, 'users', uid),
      {
        tags: tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0),
        updatedAt: new Date(),
      },
      { merge: true }
    )
  } catch (error) {
    console.error('更新個性標籤失敗:', error)
    throw error
  }
}

/**
 * 批次更新使用者資料
 * @param uid 使用者 ID
 * @param updateData 要更新的資料
 */
export const updateUserProfile = async (
  uid: string,
  updateData: Partial<UserProfile>
): Promise<void> => {
  try {
    // 準備更新資料
    const dataToUpdate: Partial<UserProfile> = {
      ...updateData,
      updatedAt: new Date(),
    }

    // 更新 Firestore
    await setDoc(doc(db, 'users', uid), dataToUpdate, { merge: true })
  } catch (error) {
    console.error('更新使用者資料失敗:', error)
    throw error
  }
}
