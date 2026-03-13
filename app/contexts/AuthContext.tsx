'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { createClient } from '../utils/supabase/client'
import {
  AuthContextType,
  UserProfile,
  RegisterFormData,
  UserPermissions,
  DEFAULT_USER_PERMISSIONS,
  DEFAULT_USER_STATS,
  DEFAULT_PRIVACY_SETTINGS,
} from '../types/user'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<UserProfile | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)

  //* 避免資料查詢卡住造成整個 UI 一直 loading
  const resolveWithTimeout = useCallback(
    async <T,>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> => {
      let timerId: ReturnType<typeof setTimeout> | null = null
      try {
        return await Promise.race<T>([
          promise,
          new Promise<T>((resolve) => {
            timerId = setTimeout(() => {
              resolve(fallback)
            }, timeoutMs)
          }),
        ])
      } finally {
        if (timerId) clearTimeout(timerId)
      }
    },
    []
  )

  //* 從 Supabase 獲取使用者資料並做對應的轉換
  const getUserProfile = useCallback(
    async (uid: string): Promise<UserProfile | null> => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*, user_stats(*)')
          .eq('id', uid)
          .maybeSingle()

        if (error) {
          console.error('獲取使用者資料時發生錯誤:', error.message)
          return null
        }
        
        if (!data) {
          console.warn(`User profile not found for uid: ${uid}`)
          return null
        }

        const statsData = Array.isArray(data.user_stats) ? data.user_stats[0] : data.user_stats
        const stats = statsData ? {
          postsCount: statsData.posts_count || 0,
          followersCount: statsData.followers_count || 0,
          followingCount: statsData.following_count || 0,
          likesReceived: statsData.likes_received || 0,
        } : DEFAULT_USER_STATS

        return {
          uid: data.id,
          email: data.email || '',
          username: data.username || '',
          displayName: data.displayName || data.display_name || data.username || '',
          photoURL: data.photoURL || data.avatar_url || '/assets/image/userEmptyAvatar.png',
          provider: data.provider || 'email',
          createdAt: new Date(data.created_at || new Date()),
          updatedAt: new Date(data.updated_at || new Date()),
          role: data.role || 'user',
          permissions: data.permissions || DEFAULT_USER_PERMISSIONS,
          bio: data.bio,
          backgroundURL: data.background_url || null,
          location: data.location,
          website: data.website,
          socialLinks: data.social_links || {},
          stats,
          privacy: data.privacy || DEFAULT_PRIVACY_SETTINGS,
          isActive: data.is_active ?? true,
          isVerified: data.is_verified ?? false,
          lastLoginAt: data.last_login_at ? new Date(data.last_login_at) : undefined,
        } as UserProfile
      } catch (error) {
        console.error('獲取使用者資料時發生例外錯誤:', error)
        return null
      }
    },
    [supabase]
  )

  //* 從 username 獲取使用者資料
  const getUserProfileByUsername = async (
    username: string
  ): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single()

      if (error || !data) return null
      return getUserProfile(data.id)
    } catch (error) {
      console.error('從 username 獲取使用者資料時發生錯誤:', error)
      return null
    }
  }

  //* 電子郵件登入
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // 觸發更新最後登入時間
        await supabase
          .from('users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', data.user.id)
        
        // 抓取包含 username 跟 stats 在內的個人資料
        const userProfile = await getUserProfile(data.user.id)
        setUser(userProfile)
      }
    } catch (error) {
      console.error('電子郵件登入失敗:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  //* Google 登入（如果已有設定好網址跟 Oauth 設定即可）
  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`, // 注意要有相應的 callback 設定
        },
      })

      if (error) throw error
    } catch (error) {
      console.error('Google 登入失敗:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  //* 註冊新使用者
  const register = async (data: RegisterFormData): Promise<{ requiresEmailConfirmation: boolean }> => {
    try {
      setLoading(true)

      let finalUsername = data.username?.trim()
      // 如果未提供 username，則從 email 中提取 @ 之前的字串作為 username
      if ((!finalUsername || finalUsername === '') && data.email) {
        finalUsername = data.email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '_')
      }

      if (!data.email || !data.password) {
        throw new Error('請提供信箱與密碼')
      }

      const avatarUrl = data.photoURL?.trim() || '/assets/image/userEmptyAvatar.png'

      // 透過 options.data 將自訂的屬性（包含 username, displayName 等）附加到 raw_user_meta_data 中
      // Supabase 的 Database Trigger 將根據這些屬性在 users table 建立對應的行
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: finalUsername,
            display_name: data.displayName || finalUsername,
            avatar_url: avatarUrl,
          },
        },
      })

      if (error) throw error

      // session 為 null 表示 Supabase 要求信箱驗證，尚未建立 session
      const requiresEmailConfirmation = !signUpData.session

      if (signUpData.user && !requiresEmailConfirmation) {
        const userProfile = await getUserProfile(signUpData.user.id)
        setUser(userProfile)
      }

      return { requiresEmailConfirmation }
    } catch (error) {
      console.error('註冊失敗:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  //* 登出
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setSupabaseUser(null)
      setIsAdmin(false)
      setIsSuperAdmin(false)
    } catch (error) {
      console.error('登出失敗:', error)
      throw error
    }
  }

  //* 更新使用者個人資料
  const updateUserProfile = async (
    uid: string,
    updateData: Partial<UserProfile>
  ): Promise<void> => {
    try {
      // 這裡簡單把 camelCase 轉成 Supabase 可能對應的 snake_case
      const payload: any = { ...updateData, updated_at: new Date().toISOString() }
      if (updateData.displayName) payload.display_name = updateData.displayName
      if (updateData.photoURL) payload.avatar_url = updateData.photoURL

      const { error } = await supabase
        .from('users')
        .update(payload)
        .eq('id', uid)

      if (error) throw error

      if (user && user.uid === uid) {
        setUser({ ...user, ...updateData })
      }
    } catch (error) {
      console.error('更新使用者資料時發生錯誤:', error)
      throw error
    }
  }

  //* 搜尋使用者
  const searchUsers = async (searchTerm: string, limit: number = 10) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url, is_verified')
        // Supabase 提供 ilike，不分大小寫的模糊搜索
        .ilike('username', `%${searchTerm}%`)
        .limit(limit)

      if (error) throw error

      return (data || []).map((doc: {
        id: string
        username: string
        display_name: string | null
        avatar_url: string | null
        is_verified: boolean | null
      }) => ({
        uid: doc.id,
        username: doc.username,
        displayName: doc.display_name || doc.username,
        photoURL: doc.avatar_url || '/assets/image/userEmptyAvatar.png',
        isVerified: Boolean(doc.is_verified),
      }))
    } catch (error) {
      console.error('搜尋使用者時發生錯誤:', error)
      return []
    }
  }

  //* 檢查 Email 是否已註冊
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      // 由於 public.users 沒有儲存 email，我們透過 RPC 函數並使用 security definer 來查詢 auth.users
      const { data, error } = await supabase.rpc('check_email_exists', {
        email_to_check: email,
      })

      if (error) {
        console.error('檢查 Email 是否存在時發生錯誤:', error.message)
        return false
      }

      return !!data
    } catch (error) {
      console.error('檢查 Email 是否存在時發生例外錯誤:', error)
      return false
    }
  }

  //* 權限檢查方法
  const hasPermission = (
    feature: keyof UserPermissions,
    action: string
  ): boolean => {
    if (!user || !user.permissions) return false
    const featurePermissions = user.permissions[
      feature
    ] as UserPermissions[keyof UserPermissions]
    return (
      featurePermissions?.[
        action as keyof UserPermissions[keyof UserPermissions]
      ] || false
    )
  }

  //* 檢查是否為超級管理員（基於環境變數）
  const checkSuperAdmin = useCallback((currentUser: User | null): boolean => {
    if (!currentUser?.email) return false
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
    return currentUser.email === adminEmail
  }, [])

  //* 監聽 Supabase 認證狀態變化
  useEffect(() => {
    let isMounted = true

    const syncAuthState = async (session: Session | null) => {
      if (!isMounted) return

      try {
        const currentSupabaseUser = session?.user || null
        setSupabaseUser(currentSupabaseUser)

        if (currentSupabaseUser) {
          const userProfile = await resolveWithTimeout<UserProfile | null>(
            getUserProfile(currentSupabaseUser.id),
            8000,
            null,
          )
          if (!isMounted) return

          setUser(userProfile)

          const isSuperAdminUser = checkSuperAdmin(currentSupabaseUser)
          setIsSuperAdmin(isSuperAdminUser)
          setIsAdmin(
            isSuperAdminUser ||
              userProfile?.role === 'admin' ||
              userProfile?.role === 'super_admin'
          )
        } else {
          setUser(null)
          setIsAdmin(false)
          setIsSuperAdmin(false)
        }
      } catch (error) {
        console.error('同步使用者狀態時發生錯誤:', error)
        if (!isMounted) return
        setUser(null)
        setSupabaseUser(null)
        setIsAdmin(false)
        setIsSuperAdmin(false)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    const initAuthState = async () => {
      try {
        const { data } = await resolveWithTimeout(
          supabase.auth.getSession(),
          8000,
          { data: { session: null }, error: null },
        )

        await syncAuthState(data.session)
      } catch (error) {
        console.error('初始化使用者狀態時發生例外錯誤:', error)
        if (isMounted) setLoading(false)
      }
    }

    initAuthState()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        void syncAuthState(session)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [getUserProfile, checkSuperAdmin, supabase, resolveWithTimeout])

  const value: AuthContextType = {
    user,
    supabaseUser,
    loading,
    getUserProfile,
    getUserProfileByUsername,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    register,
    updateUserProfile,
    searchUsers,
    hasPermission,
    isAdmin,
    isSuperAdmin,
    checkEmailExists,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
