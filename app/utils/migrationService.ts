import {
  collection,
  getDocs,
  doc,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import {
  UserProfile,
  DEFAULT_USER_STATS,
  DEFAULT_PRIVACY_SETTINGS,
} from '../types/user'

/**
 * 資料遷移服務
 * 用於更新現有使用者資料結構以支援新功能
 */

//* 遷移現有使用者資料到新結構
export const migrateExistingUsers = async (): Promise<{
  success: number
  failed: number
  errors: string[]
}> => {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  }

  try {
    console.log('開始遷移現有使用者資料...')

    // 獲取所有使用者
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)

    console.log(`找到 ${snapshot.size} 個使用者需要遷移`)

    // 使用批次寫入提高效能
    const batch = writeBatch(db)
    let batchCount = 0
    const BATCH_SIZE = 500 // Firestore 批次寫入限制

    for (const userDoc of snapshot.docs) {
      try {
        const userData = userDoc.data() as Partial<UserProfile>
        const uid = userDoc.id

        // 檢查是否需要遷移
        const needsMigration =
          !userData.stats ||
          !userData.privacy ||
          userData.isActive === undefined ||
          userData.isVerified === undefined

        if (!needsMigration) {
          console.log(`使用者 ${uid} 已經是最新結構，跳過`)
          continue
        }

        // 準備遷移資料
        const migrationData: Partial<UserProfile> = {
          updatedAt: new Date(),
        }

        // 新增統計資料（如果不存在）
        if (!userData.stats) {
          migrationData.stats = DEFAULT_USER_STATS
        }

        // 新增隱私設定（如果不存在）
        if (!userData.privacy) {
          migrationData.privacy = DEFAULT_PRIVACY_SETTINGS
        }

        // 新增帳號狀態（如果不存在）
        if (userData.isActive === undefined) {
          migrationData.isActive = true
        }

        if (userData.isVerified === undefined) {
          migrationData.isVerified = false
        }

        // 新增最後登入時間（如果不存在）
        if (!userData.lastLoginAt) {
          const createdAtValue = userData.createdAt
          let createdDate: Date

          if (
            createdAtValue &&
            typeof createdAtValue === 'object' &&
            'toDate' in createdAtValue
          ) {
            // Firestore Timestamp
            createdDate = (createdAtValue as { toDate: () => Date }).toDate()
          } else if (createdAtValue) {
            // Date 或字串
            createdDate = new Date(createdAtValue as string | number | Date)
          } else {
            createdDate = new Date()
          }

          migrationData.lastLoginAt = createdDate
        }

        // 添加到批次
        const userRef = doc(db, 'users', uid)
        batch.set(userRef, migrationData, { merge: true })
        batchCount++

        // 如果達到批次大小限制，執行批次寫入
        if (batchCount >= BATCH_SIZE) {
          await batch.commit()
          console.log(`已完成 ${batchCount} 個使用者的遷移`)
          batchCount = 0
        }

        results.success++
      } catch (error) {
        console.error(`遷移使用者 ${userDoc.id} 失敗:`, error)
        results.failed++
        results.errors.push(`${userDoc.id}: ${(error as Error).message}`)
      }
    }

    // 執行剩餘的批次寫入
    if (batchCount > 0) {
      await batch.commit()
      console.log(`已完成最後 ${batchCount} 個使用者的遷移`)
    }

    console.log('使用者資料遷移完成！')
    console.log(`成功: ${results.success}, 失敗: ${results.failed}`)
  } catch (error) {
    console.error('遷移過程中發生錯誤:', error)
    results.errors.push(`遷移過程錯誤: ${(error as Error).message}`)
  }

  return results
}

//* 驗證資料完整性
export const validateUserDataIntegrity = async (): Promise<{
  totalUsers: number
  validUsers: number
  invalidUsers: string[]
  missingFields: { [uid: string]: string[] }
}> => {
  const results = {
    totalUsers: 0,
    validUsers: 0,
    invalidUsers: [] as string[],
    missingFields: {} as { [uid: string]: string[] },
  }

  try {
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)

    results.totalUsers = snapshot.size

    snapshot.forEach((doc) => {
      const userData = doc.data() as Partial<UserProfile>
      const uid = doc.id
      const missing: string[] = []

      // 檢查必要欄位
      const requiredFields: (keyof UserProfile)[] = [
        'uid',
        'email',
        'username',
        'displayName',
        'photoURL',
        'provider',
        'role',
        'permissions',
        'stats',
        'privacy',
        'isActive',
        'isVerified',
        'createdAt',
        'updatedAt',
      ]

      requiredFields.forEach((field) => {
        if (userData[field] === undefined || userData[field] === null) {
          missing.push(field as string)
        }
      })

      if (missing.length > 0) {
        results.invalidUsers.push(uid)
        results.missingFields[uid] = missing
      } else {
        results.validUsers++
      }
    })
  } catch (error) {
    console.error('驗證資料完整性時發生錯誤:', error)
  }

  return results
}

//* 清理無效資料
export const cleanupInvalidData = async (): Promise<{
  cleaned: number
  errors: string[]
}> => {
  const results = {
    cleaned: 0,
    errors: [] as string[],
  }

  try {
    // 這裡可以實作清理邏輯
    // 例如：刪除沒有必要欄位的使用者資料
    console.log('清理無效資料功能待實作')
  } catch (error) {
    console.error('清理無效資料時發生錯誤:', error)
    results.errors.push((error as Error).message)
  }

  return results
}

//* 備份使用者資料
export const backupUserData = async (): Promise<{
  success: boolean
  backupId: string
  userCount: number
  error?: string
}> => {
  try {
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)

    const backupId = `backup_${Date.now()}`
    const backupData: Record<string, Record<string, unknown>> = {}

    snapshot.forEach((doc) => {
      backupData[doc.id] = doc.data()
    })

    // 將備份資料儲存到 Firestore 的備份集合
    await setDoc(doc(db, 'backups', backupId), {
      type: 'users',
      createdAt: new Date(),
      data: backupData as Record<string, unknown>,
      userCount: snapshot.size,
    })

    return {
      success: true,
      backupId,
      userCount: snapshot.size,
    }
  } catch (error) {
    console.error('備份使用者資料時發生錯誤:', error)
    return {
      success: false,
      backupId: '',
      userCount: 0,
      error: (error as Error).message,
    }
  }
}

//* 執行完整的資料遷移流程
export const runFullMigration = async (): Promise<{
  backup: Awaited<ReturnType<typeof backupUserData>>
  validation: Awaited<ReturnType<typeof validateUserDataIntegrity>>
  migration: Awaited<ReturnType<typeof migrateExistingUsers>>
}> => {
  console.log('開始執行完整的資料遷移流程...')

  // 1. 備份現有資料
  console.log('步驟 1: 備份現有資料')
  const backup = await backupUserData()

  if (!backup.success) {
    throw new Error(`備份失敗: ${backup.error}`)
  }

  // 2. 驗證資料完整性
  console.log('步驟 2: 驗證資料完整性')
  const validation = await validateUserDataIntegrity()

  // 3. 執行遷移
  console.log('步驟 3: 執行資料遷移')
  const migration = await migrateExistingUsers()

  console.log('完整的資料遷移流程完成！')

  return {
    backup,
    validation,
    migration,
  }
}
