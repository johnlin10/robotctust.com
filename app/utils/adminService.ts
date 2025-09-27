import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore'
import { User } from 'firebase/auth'
import { db } from './firebase'
import { AuthorizedUser, AccessControlDocument } from '../types/post'

const ACCESS_CONTROL_COLLECTION = 'accessControl'
const ACCESS_CONTROL_DOC = 'canPostNews'

/**
 * 檢查使用者是否為超級管理員
 */
export function isSuperAdmin(user: User | null): boolean {
  if (!user?.email) return false
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
  return user.email === adminEmail
}

/**
 * 獲取所有授權使用者列表
 */
export async function getAuthorizedUsers(): Promise<AuthorizedUser[]> {
  try {
    const accessControlRef = doc(
      db,
      ACCESS_CONTROL_COLLECTION,
      ACCESS_CONTROL_DOC
    )
    const accessControlSnap = await getDoc(accessControlRef)

    if (!accessControlSnap.exists()) {
      // 如果文件不存在，創建一個空的文件
      await setDoc(accessControlRef, { authorizedUsers: [] })
      return []
    }

    const data = accessControlSnap.data() as AccessControlDocument
    return data.authorizedUsers || []
  } catch (error) {
    console.error('Error fetching authorized users:', error)
    throw new Error('無法獲取授權使用者列表')
  }
}

/**
 * 添加授權使用者
 */
export async function addAuthorizedUser(
  adminUser: User,
  email: string
): Promise<void> {
  if (!isSuperAdmin(adminUser)) {
    throw new Error('只有超級管理員可以添加授權使用者')
  }

  if (!email || !email.includes('@')) {
    throw new Error('請輸入有效的電子郵件地址')
  }

  try {
    const accessControlRef = doc(
      db,
      ACCESS_CONTROL_COLLECTION,
      ACCESS_CONTROL_DOC
    )
    const accessControlSnap = await getDoc(accessControlRef)

    const newUser: AuthorizedUser = {
      email: email.trim().toLowerCase(),
      active: true,
    }

    if (!accessControlSnap.exists()) {
      // 創建新文件
      await setDoc(accessControlRef, {
        authorizedUsers: [newUser],
      })
    } else {
      // 檢查使用者是否已存在
      const data = accessControlSnap.data() as AccessControlDocument
      const existingUser = data.authorizedUsers?.find(
        (user) => user.email === newUser.email
      )

      if (existingUser) {
        throw new Error('該使用者已在授權列表中')
      }

      // 添加新使用者
      await updateDoc(accessControlRef, {
        authorizedUsers: arrayUnion(newUser),
      })
    }
  } catch (error) {
    console.error('Error adding authorized user:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('添加授權使用者失敗')
  }
}

/**
 * 移除授權使用者
 */
export async function removeAuthorizedUser(
  adminUser: User,
  email: string
): Promise<void> {
  if (!isSuperAdmin(adminUser)) {
    throw new Error('只有超級管理員可以移除授權使用者')
  }

  try {
    const accessControlRef = doc(
      db,
      ACCESS_CONTROL_COLLECTION,
      ACCESS_CONTROL_DOC
    )
    const accessControlSnap = await getDoc(accessControlRef)

    if (!accessControlSnap.exists()) {
      throw new Error('授權控制文件不存在')
    }

    const data = accessControlSnap.data() as AccessControlDocument
    const userToRemove = data.authorizedUsers?.find(
      (user) => user.email === email.trim().toLowerCase()
    )

    if (!userToRemove) {
      throw new Error('找不到該授權使用者')
    }

    // 移除使用者
    await updateDoc(accessControlRef, {
      authorizedUsers: arrayRemove(userToRemove),
    })
  } catch (error) {
    console.error('Error removing authorized user:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('移除授權使用者失敗')
  }
}

/**
 * 切換使用者的啟用狀態
 */
export async function toggleUserStatus(
  adminUser: User,
  email: string
): Promise<void> {
  if (!isSuperAdmin(adminUser)) {
    throw new Error('只有超級管理員可以修改使用者狀態')
  }

  try {
    const accessControlRef = doc(
      db,
      ACCESS_CONTROL_COLLECTION,
      ACCESS_CONTROL_DOC
    )
    const accessControlSnap = await getDoc(accessControlRef)

    if (!accessControlSnap.exists()) {
      throw new Error('授權控制文件不存在')
    }

    const data = accessControlSnap.data() as AccessControlDocument
    const userIndex = data.authorizedUsers?.findIndex(
      (user) => user.email === email.trim().toLowerCase()
    )

    if (userIndex === -1 || userIndex === undefined) {
      throw new Error('找不到該授權使用者')
    }

    const updatedUsers = [...(data.authorizedUsers || [])]
    updatedUsers[userIndex] = {
      ...updatedUsers[userIndex],
      active: !updatedUsers[userIndex].active,
    }

    await updateDoc(accessControlRef, {
      authorizedUsers: updatedUsers,
    })
  } catch (error) {
    console.error('Error toggling user status:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('修改使用者狀態失敗')
  }
}

/**
 * 初始化權限控制文件（如果不存在）
 */
export async function initializeAccessControl(adminUser: User): Promise<void> {
  if (!isSuperAdmin(adminUser)) {
    throw new Error('只有超級管理員可以初始化權限控制')
  }

  try {
    const accessControlRef = doc(
      db,
      ACCESS_CONTROL_COLLECTION,
      ACCESS_CONTROL_DOC
    )
    const accessControlSnap = await getDoc(accessControlRef)

    if (!accessControlSnap.exists()) {
      // 創建初始文件，包含管理員自己
      const initialData: AccessControlDocument = {
        authorizedUsers: [
          {
            email: adminUser.email!.toLowerCase(),
            active: true,
          },
        ],
      }

      await setDoc(accessControlRef, initialData)
    }
  } catch (error) {
    console.error('Error initializing access control:', error)
    throw new Error('初始化權限控制失敗')
  }
}
