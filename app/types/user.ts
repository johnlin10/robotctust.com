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
  role: 'super_admin' | 'admin' | 'user'
  permissions: UserPermissions
  // 新增社群功能相關欄位
  bio?: string // 個人簡介
  location?: string // 所在地
  website?: string // 個人網站
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

export interface UserPermissions {
  announcements: {
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
  }
  downloads: {
    canManage: boolean
  }
}

export const DEFAULT_USER_PERMISSIONS: UserPermissions = {
  announcements: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
  },
  downloads: {
    canManage: false,
  },
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

export const ADMIN_PERMISSIONS: UserPermissions = {
  announcements: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
  },
  downloads: {
    canManage: true,
  },
}

export const SUPER_ADMIN_PERMISSIONS: UserPermissions = {
  announcements: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
  },
  downloads: {
    canManage: true,
  },
}

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
  role?: 'super_admin' | 'admin' | 'user'
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

//* 建立完整使用者資料的輔助函數
export const createDefaultUserProfile = (
  firebaseUser: User,
  additionalData: Partial<UserProfile>
): UserProfile => {
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
    role: 'user',
    permissions: DEFAULT_USER_PERMISSIONS,
    stats: DEFAULT_USER_STATS,
    privacy: DEFAULT_PRIVACY_SETTINGS,
    isActive: true,
    isVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    ...additionalData,
  }
}
