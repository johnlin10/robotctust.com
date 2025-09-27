import { User } from 'firebase/auth'

export interface UserProfile {
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
