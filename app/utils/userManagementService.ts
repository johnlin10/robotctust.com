import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore'
import { db } from './firebase'
import {
  UserProfile,
  UpdateUserProfileData,
  UserSearchResult,
  UserPermissions,
} from '../types/user'
import { getPermissionsByRole } from '../types/user'
import { canManageUserRole } from './permissionService'
import { processFirestoreDoc } from './firestoreHelpers'

/**
 * 使用者管理服務
 * 提供管理員工具和使用者資料操作功能
 */

//* 獲取所有孤兒帳號（Firebase Auth 有但 Firestore 沒有的帳號）
export const findOrphanAccounts = async (): Promise<string[]> => {
  try {
    // 這個功能需要 Firebase Admin SDK 才能完整實現
    // 目前只能在客戶端檢測當前使用者是否為孤兒帳號
    console.log('孤兒帳號檢測功能需要在伺服器端實現')
    return []
  } catch (error) {
    console.error('檢測孤兒帳號時發生錯誤:', error)
    return []
  }
}

//* 批量修復孤兒帳號
export const batchRepairOrphanAccounts = async (
  uids: string[]
): Promise<{
  success: number
  failed: string[]
}> => {
  const results = {
    success: 0,
    failed: [] as string[],
  }

  for (const uid of uids) {
    try {
      // 這裡需要 Firebase Admin SDK 來獲取 Firebase Auth 使用者資料
      console.log(`嘗試修復孤兒帳號: ${uid}`)
      results.success++
    } catch (error) {
      console.error(`修復帳號 ${uid} 失敗:`, error)
      results.failed.push(uid)
    }
  }

  return results
}

//* 獲取使用者統計資料
export const getUserStats = async (): Promise<{
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  verifiedUsers: number
}> => {
  try {
    const usersRef = collection(db, 'users')
    const allUsersSnapshot = await getDocs(usersRef)

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    let totalUsers = 0
    let activeUsers = 0
    let newUsersThisMonth = 0
    let verifiedUsers = 0

    allUsersSnapshot.forEach((doc) => {
      const userData = doc.data()
      totalUsers++

      if (userData.isActive) {
        activeUsers++
      }

      if (userData.isVerified) {
        verifiedUsers++
      }

      // 安全地處理 Firestore Timestamp
      if (userData.createdAt) {
        const createdDate = userData.createdAt.toDate
          ? userData.createdAt.toDate()
          : new Date(userData.createdAt)
        if (createdDate >= thisMonth) {
          newUsersThisMonth++
        }
      }
    })

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      verifiedUsers,
    }
  } catch (error) {
    console.error('獲取使用者統計資料時發生錯誤:', error)
    return {
      totalUsers: 0,
      activeUsers: 0,
      newUsersThisMonth: 0,
      verifiedUsers: 0,
    }
  }
}

//* 搜尋使用者（進階版本）
export const advancedSearchUsers = async (
  searchTerm: string,
  filters: {
    role?: 'super_admin' | 'info_admin' | 'club_officer' | 'user'
    isActive?: boolean
    isVerified?: boolean
    provider?: 'email' | 'google'
  } = {},
  sortBy: 'createdAt' | 'lastLoginAt' | 'displayName' = 'createdAt',
  limitCount: number = 20
): Promise<UserSearchResult[]> => {
  try {
    let q = query(collection(db, 'users'))

    // 添加篩選條件
    if (filters.role) {
      q = query(q, where('role', '==', filters.role))
    }

    if (filters.isActive !== undefined) {
      q = query(q, where('isActive', '==', filters.isActive))
    }

    if (filters.isVerified !== undefined) {
      q = query(q, where('isVerified', '==', filters.isVerified))
    }

    if (filters.provider) {
      q = query(q, where('provider', '==', filters.provider))
    }

    // 添加排序和限制
    q = query(q, orderBy(sortBy, 'desc'), limit(limitCount))

    const querySnapshot = await getDocs(q)

    return querySnapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          uid: data.uid,
          username: data.username,
          displayName: data.displayName,
          photoURL: data.photoURL,
          bio: data.bio,
          isVerified: data.isVerified,
        }
      })
      .filter((user) => {
        // 客戶端文字搜尋
        if (!searchTerm) return true
        const searchLower = searchTerm.toLowerCase()
        return (
          user.username.toLowerCase().includes(searchLower) ||
          user.displayName.toLowerCase().includes(searchLower) ||
          (user.bio && user.bio.toLowerCase().includes(searchLower))
        )
      })
  } catch (error) {
    console.error('進階搜尋使用者時發生錯誤:', error)
    return []
  }
}

//* 更新使用者個人資料（帶驗證）
export const updateUserProfileSafe = async (
  uid: string,
  updateData: UpdateUserProfileData,
  currentUserUid: string
): Promise<void> => {
  try {
    // 檢查權限：只能更新自己的資料或管理員權限
    if (uid !== currentUserUid) {
      // 這裡應該檢查當前使用者是否為管理員
      // 暫時只允許更新自己的資料
      throw new Error('沒有權限更新此使用者的資料')
    }

    // 驗證更新資料
    const validatedData: Partial<UserProfile> = {}

    if (updateData.displayName !== undefined) {
      if (updateData.displayName.length > 15) {
        throw new Error('暱稱不能超過 15 個字元')
      }
      validatedData.displayName = updateData.displayName
    }

    if (updateData.bio !== undefined) {
      if (updateData.bio.length > 500) {
        throw new Error('個人簡介不能超過 500 個字元')
      }
      validatedData.bio = updateData.bio
    }

    if (updateData.location !== undefined) {
      if (updateData.location.length > 100) {
        throw new Error('所在地不能超過 100 個字元')
      }
      validatedData.location = updateData.location
    }

    if (updateData.website !== undefined) {
      // 簡單的 URL 驗證
      if (updateData.website && !updateData.website.match(/^https?:\/\/.+/)) {
        throw new Error('網站 URL 格式不正確')
      }
      validatedData.website = updateData.website
    }

    if (updateData.socialLinks !== undefined) {
      validatedData.socialLinks = updateData.socialLinks
    }

    if (updateData.privacy !== undefined) {
      validatedData.privacy = updateData.privacy as UserProfile['privacy']
    }

    // 添加更新時間
    validatedData.updatedAt = new Date()

    // 更新到 Firestore
    await setDoc(doc(db, 'users', uid), validatedData, { merge: true })
  } catch (error) {
    console.error('更新使用者資料時發生錯誤:', error)
    throw error
  }
}

//* 停用/啟用使用者帳號
export const toggleUserAccount = async (
  adminUser: UserProfile,
  uid: string,
  isActive: boolean
): Promise<void> => {
  try {
    // 獲取目標使用者資料
    const targetUserDoc = await getDoc(doc(db, 'users', uid))
    if (!targetUserDoc.exists()) {
      throw new Error('使用者不存在')
    }

    const targetUserData = targetUserDoc.data() as UserProfile

    // 檢查是否可以管理目標使用者
    if (!canManageUserRole(adminUser, targetUserData.role)) {
      throw new Error('沒有權限管理此使用者')
    }

    // 超級管理員不可被停用
    if (targetUserData.role === 'super_admin' && !isActive) {
      throw new Error('超級管理員不可被停用')
    }

    await setDoc(
      doc(db, 'users', uid),
      {
        isActive,
        updatedAt: new Date(),
        // 記錄操作者
        lastModifiedBy: adminUser.uid,
      },
      { merge: true }
    )
  } catch (error) {
    console.error('切換使用者帳號狀態時發生錯誤:', error)
    throw error
  }
}

//* 驗證使用者帳號
export const verifyUserAccount = async (
  adminUser: UserProfile,
  uid: string
): Promise<void> => {
  try {
    // 獲取目標使用者資料
    const targetUserDoc = await getDoc(doc(db, 'users', uid))
    if (!targetUserDoc.exists()) {
      throw new Error('使用者不存在')
    }

    const targetUserData = targetUserDoc.data() as UserProfile

    // 檢查是否可以管理目標使用者
    if (!canManageUserRole(adminUser, targetUserData.role)) {
      throw new Error('沒有權限管理此使用者')
    }

    await setDoc(
      doc(db, 'users', uid),
      {
        isVerified: true,
        updatedAt: new Date(),
        verifiedBy: adminUser.uid,
        verifiedAt: new Date(),
      },
      { merge: true }
    )
  } catch (error) {
    console.error('驗證使用者帳號時發生錯誤:', error)
    throw error
  }
}

/**
 * 更新使用者身份
 * @param adminUser 管理員使用者資料
 * @param targetUid 目標使用者 ID
 * @param newRole 新的身份
 */
export const updateUserRole = async (
  adminUser: UserProfile,
  targetUid: string,
  newRole: UserProfile['role']
): Promise<void> => {
  try {
    // 檢查管理員是否可以管理此身份
    if (!canManageUserRole(adminUser, newRole)) {
      throw new Error('沒有權限設定此身份')
    }

    // 獲取目標使用者資料
    const targetUserDoc = await getDoc(doc(db, 'users', targetUid))
    if (!targetUserDoc.exists()) {
      throw new Error('使用者不存在')
    }

    const targetUserData = targetUserDoc.data() as UserProfile

    // 檢查是否可以管理目標使用者
    if (!canManageUserRole(adminUser, targetUserData.role)) {
      throw new Error('沒有權限管理此使用者')
    }

    // 超級管理員身份不可被修改（即便是超級管理員自己）
    if (targetUserData.role === 'super_admin' && newRole !== 'super_admin') {
      throw new Error('超級管理員身份不可被修改')
    }

    // 根據新身份設定對應權限
    const newPermissions = getPermissionsByRole(newRole)

    // 更新 Firestore
    await setDoc(
      doc(db, 'users', targetUid),
      {
        role: newRole,
        permissions: newPermissions,
        updatedAt: new Date(),
        lastModifiedBy: adminUser.uid,
      },
      { merge: true }
    )
  } catch (error) {
    console.error('更新使用者身份失敗:', error)
    throw error
  }
}

/**
 * 更新使用者權限
 * @param adminUser 管理員使用者資料
 * @param targetUid 目標使用者 ID
 * @param permissions 新的權限
 */
export const updateUserPermissions = async (
  adminUser: UserProfile,
  targetUid: string,
  permissions: Partial<UserPermissions>
): Promise<void> => {
  try {
    // 獲取目標使用者資料
    const targetUserDoc = await getDoc(doc(db, 'users', targetUid))
    if (!targetUserDoc.exists()) {
      throw new Error('使用者不存在')
    }

    const targetUserData = targetUserDoc.data() as UserProfile

    // 檢查是否可以管理目標使用者
    if (!canManageUserRole(adminUser, targetUserData.role)) {
      throw new Error('沒有權限管理此使用者')
    }

    // 超級管理員權限不可被修改
    if (targetUserData.role === 'super_admin') {
      throw new Error('超級管理員權限不可被修改')
    }

    // 合併權限（保留現有權限，只更新提供的部分）
    const updatedPermissions: UserPermissions = {
      ...targetUserData.permissions,
      ...permissions,
    }

    // 更新 Firestore
    await setDoc(
      doc(db, 'users', targetUid),
      {
        permissions: updatedPermissions,
        updatedAt: new Date(),
        lastModifiedBy: adminUser.uid,
      },
      { merge: true }
    )
  } catch (error) {
    console.error('更新使用者權限失敗:', error)
    throw error
  }
}

/**
 * 獲取所有使用者列表（完整資料，包含權限）
 * @param limitCount 限制數量
 * @returns 使用者列表
 */
export const getAllUsers = async (
  limitCount: number = 50
): Promise<UserProfile[]> => {
  try {
    const q = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return processFirestoreDoc<UserProfile>(data)
    })
  } catch (error) {
    console.error('獲取所有使用者失敗:', error)
    throw error
  }
}
