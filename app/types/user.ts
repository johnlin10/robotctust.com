import { User } from 'firebase/auth'

export interface UserProfile extends Record<string, unknown> {
  uid: string
  email: string
  username: string // 帳號名稱（英文大小寫、_、-）
  displayName: string // 暱稱（公開顯示名稱）
  photoURL: string
  provider: 'email' | 'google'
  createdAt: Date
  updatedAt: Date
  role: 'super_admin' | 'info_admin' | 'club_officer' | 'user'
  permissions: UserPermissions
  // 新增社群功能相關欄位
  bio?: string // 個人簡介
  location?: string // 所在地
  website?: string // 個人網站
  tags?: string[] // 個性標籤（未來擴展）
  socialLinks?: {
    github?: string
    linkedin?: string
    twitter?: string
    instagram?: string
  }
  // 統計資料
  stats: {
    postsCount: number // 發文數量
    followersCount: number // 追蹤者數量
    followingCount: number // 追蹤中數量
    likesReceived: number // 收到的讚數
  }
  // 隱私設定
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends' // 個人檔案可見性
    showEmail: boolean // 是否顯示電子郵件
    showStats: boolean // 是否顯示統計資料
  }
  // 帳號狀態
  isActive: boolean // 帳號是否啟用
  isVerified: boolean // 是否已驗證
  lastLoginAt?: Date // 最後登入時間
}

/**
 * 使用者權限介面
 * 對應權限系統文件中的 A-G 權限：
 * A. 不受任何限制 (unrestricted)
 * B. 管理所有帳號權限 (manageAllPermissions)
 * C. 管理所有帳號個人貼文（僅刪除）(manageAllPosts)
 * D. 管理帳號權限（除了超級管理員）(managePermissions)
 * E. 查看社團內部頁面、資料 (viewInternalPages)
 * F. 發表個人文章 (createPersonalPosts)
 * G. 發表社團官方文章 (createOfficialPosts)
 */
export interface UserPermissions {
  unrestricted: boolean // A. 不受任何限制
  manageAllPermissions: boolean // B. 管理所有帳號權限
  manageAllPosts: boolean // C. 管理所有帳號個人貼文（僅刪除）
  managePermissions: boolean // D. 管理帳號權限（除了超級管理員）
  viewInternalPages: boolean // E. 查看社團內部頁面、資料
  createPersonalPosts: boolean // F. 發表個人文章
  createOfficialPosts: boolean // G. 發表社團官方文章
}

//* 預設使用者權限（一般使用者：F）
export const DEFAULT_USER_PERMISSIONS: UserPermissions = {
  unrestricted: false,
  manageAllPermissions: false,
  manageAllPosts: false,
  managePermissions: false,
  viewInternalPages: false,
  createPersonalPosts: true, // F. 發表個人文章
  createOfficialPosts: false,
}

//* 預設使用者統計資料
export const DEFAULT_USER_STATS = {
  postsCount: 0,
  followersCount: 0,
  followingCount: 0,
  likesReceived: 0,
}

//* 預設隱私設定
export const DEFAULT_PRIVACY_SETTINGS = {
  profileVisibility: 'public' as const,
  showEmail: false,
  showStats: true,
}

//* 社團幹部權限（EF）
export const CLUB_OFFICER_PERMISSIONS: UserPermissions = {
  unrestricted: false,
  manageAllPermissions: false,
  manageAllPosts: false,
  managePermissions: false,
  viewInternalPages: true, // E. 查看社團內部頁面、資料
  createPersonalPosts: true, // F. 發表個人文章
  createOfficialPosts: false,
}

//* 資訊管理員權限（DEFG）
export const INFO_ADMIN_PERMISSIONS: UserPermissions = {
  unrestricted: false,
  manageAllPermissions: false,
  manageAllPosts: false,
  managePermissions: true, // D. 管理帳號權限（除了超級管理員）
  viewInternalPages: true, // E. 查看社團內部頁面、資料
  createPersonalPosts: true, // F. 發表個人文章
  createOfficialPosts: true, // G. 發表社團官方文章
}

//* 超級管理員權限（ABCDEFG - 全部）
export const SUPER_ADMIN_PERMISSIONS: UserPermissions = {
  unrestricted: true, // A. 不受任何限制
  manageAllPermissions: true, // B. 管理所有帳號權限
  manageAllPosts: true, // C. 管理所有帳號個人貼文（僅刪除）
  managePermissions: true, // D. 管理帳號權限（除了超級管理員）
  viewInternalPages: true, // E. 查看社團內部頁面、資料
  createPersonalPosts: true, // F. 發表個人文章
  createOfficialPosts: true, // G. 發表社團官方文章
}

//* 向後相容：保留舊的 ADMIN_PERMISSIONS（映射到 INFO_ADMIN_PERMISSIONS）
export const ADMIN_PERMISSIONS: UserPermissions = INFO_ADMIN_PERMISSIONS

export interface RegisterFormData {
  email?: string
  password?: string
  confirmPassword?: string
  username: string
  displayName: string
  photoURL?: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  getUserProfile: (uid: string) => Promise<UserProfile | null>
  getUserProfileByUsername: (username: string) => Promise<UserProfile | null>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  register: (data: RegisterFormData) => Promise<void>
  updateUserProfile: (
    uid: string,
    updateData: Partial<UserProfile>
  ) => Promise<void>
  searchUsers: (
    searchTerm: string,
    limit?: number
  ) => Promise<UserSearchResult[]>
  hasPermission: (feature: keyof UserPermissions, action: string) => boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  firebaseUser: User | null // 添加 Firebase User 對象
}

export interface UpdateUserPermissionsData {
  uid: string
  permissions?: Partial<UserPermissions>
  role?: 'super_admin' | 'info_admin' | 'club_officer' | 'user'
}

//* 更新使用者個人資料的資料結構
export interface UpdateUserProfileData {
  displayName?: string
  bio?: string
  location?: string
  website?: string
  socialLinks?: Partial<UserProfile['socialLinks']>
  privacy?: Partial<UserProfile['privacy']>
}

//* 使用者搜尋結果
export interface UserSearchResult {
  uid: string
  username: string
  displayName: string
  photoURL: string
  bio?: string
  isVerified: boolean
}

//* 根據身份獲取對應權限
export const getPermissionsByRole = (
  role: UserProfile['role']
): UserPermissions => {
  switch (role) {
    case 'super_admin':
      return SUPER_ADMIN_PERMISSIONS
    case 'info_admin':
      return INFO_ADMIN_PERMISSIONS
    case 'club_officer':
      return CLUB_OFFICER_PERMISSIONS
    case 'user':
    default:
      return DEFAULT_USER_PERMISSIONS
  }
}

//* 建立完整使用者資料的輔助函數
export const createDefaultUserProfile = (
  firebaseUser: User,
  additionalData: Partial<UserProfile>
): UserProfile => {
  // 確定身份（優先使用 additionalData 中的 role，否則預設為 'user'）
  const role = additionalData.role || 'user'
  
  // 根據身份設定對應權限
  const permissions = additionalData.permissions || getPermissionsByRole(role)

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    username: additionalData.username || '',
    displayName: additionalData.displayName || firebaseUser.displayName || '',
    photoURL:
      additionalData.photoURL ||
      firebaseUser.photoURL ||
      '/assets/image/userEmptyAvatar.png',
    provider: additionalData.provider || 'email',
    role,
    permissions,
    stats: additionalData.stats || DEFAULT_USER_STATS,
    privacy: additionalData.privacy || DEFAULT_PRIVACY_SETTINGS,
    isActive: additionalData.isActive !== undefined ? additionalData.isActive : true,
    isVerified: additionalData.isVerified !== undefined ? additionalData.isVerified : false,
    createdAt: additionalData.createdAt || new Date(),
    updatedAt: additionalData.updatedAt || new Date(),
    lastLoginAt: additionalData.lastLoginAt || new Date(),
    // 保留其他額外資料
    bio: additionalData.bio,
    location: additionalData.location,
    website: additionalData.website,
    tags: additionalData.tags,
    socialLinks: additionalData.socialLinks,
  }
}
