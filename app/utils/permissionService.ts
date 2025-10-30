/**
 * 權限檢查服務
 * 提供權限檢查的輔助函數
 */

import { UserProfile, UserPermissions } from '../types/user'

/**
 * 檢查使用者是否有特定權限
 * @param user 使用者資料
 * @param permission 權限名稱（A-G）
 * @returns 是否有權限
 */
export const hasPermission = (
  user: UserProfile | null,
  permission: keyof UserPermissions
): boolean => {
  if (!user || !user.permissions) return false
  return user.permissions[permission] === true
}

/**
 * 檢查是否可以管理目標使用者
 * @param user 當前使用者
 * @param targetUser 目標使用者
 * @returns 是否可以管理
 */
export const canManageUser = (
  user: UserProfile | null,
  targetUser: UserProfile | null
): boolean => {
  if (!user || !targetUser) return false

  // 超級管理員可以管理所有帳號
  if (user.role === 'super_admin') return true

  // 資訊管理員可以管理除超級管理員外的所有帳號
  if (user.role === 'info_admin') {
    return targetUser.role !== 'super_admin'
  }

  // 其他身份無法管理其他帳號
  return false
}

/**
 * 檢查是否可以管理特定身份
 * @param user 當前使用者
 * @param targetRole 目標身份
 * @returns 是否可以管理
 */
export const canManageUserRole = (
  user: UserProfile | null,
  targetRole: UserProfile['role']
): boolean => {
  if (!user) return false

  // 超級管理員可以管理所有身份
  if (user.role === 'super_admin') return true

  // 資訊管理員可以管理除超級管理員外的所有身份
  if (user.role === 'info_admin') {
    return targetRole !== 'super_admin'
  }

  // 其他身份無法管理
  return false
}

/**
 * 檢查是否可以刪除貼文
 * @param user 當前使用者
 * @param postAuthorId 貼文作者 ID
 * @returns 是否可以刪除
 */
export const canDeletePost = (
  user: UserProfile | null,
  postAuthorId: string
): boolean => {
  if (!user) return false

  // 超級管理員和資訊管理員可以刪除所有貼文
  if (
    user.role === 'super_admin' ||
    (user.role === 'info_admin' && hasPermission(user, 'manageAllPosts'))
  ) {
    return true
  }

  // 一般使用者只能刪除自己的貼文
  return user.uid === postAuthorId
}

/**
 * 檢查是否可以查看社團內部頁面
 * @param user 使用者資料
 * @returns 是否可以查看
 */
export const canViewInternalPages = (user: UserProfile | null): boolean => {
  return hasPermission(user, 'viewInternalPages')
}

/**
 * 檢查是否可以發表個人文章
 * @param user 使用者資料
 * @returns 是否可以發表
 */
export const canCreatePersonalPosts = (user: UserProfile | null): boolean => {
  return hasPermission(user, 'createPersonalPosts')
}

/**
 * 檢查是否可以發表社團官方文章
 * @param user 使用者資料
 * @returns 是否可以發表
 */
export const canCreateOfficialPosts = (user: UserProfile | null): boolean => {
  return hasPermission(user, 'createOfficialPosts')
}

/**
 * 檢查是否為管理員
 * @param user 使用者資料
 * @returns 是否為管理員
 */
export const isAdmin = (user: UserProfile | null): boolean => {
  if (!user) return false
  return (
    user.role === 'super_admin' ||
    user.role === 'info_admin' ||
    user.role === 'club_officer'
  )
}

/**
 * 檢查是否為超級管理員
 * @param user 使用者資料
 * @returns 是否為超級管理員
 */
export const isSuperAdmin = (user: UserProfile | null): boolean => {
  if (!user) return false
  return user.role === 'super_admin'
}
