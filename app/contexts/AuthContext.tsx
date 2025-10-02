'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  query,
  where,
  collection,
  getDocs,
} from 'firebase/firestore'
import { auth, db, googleProvider } from '../utils/firebase'
import { processFirestoreDoc } from '../utils/firestoreHelpers'
import {
  AuthContextType,
  UserProfile,
  RegisterFormData,
  UserPermissions,
  createDefaultUserProfile,
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
  const [user, setUser] = useState<UserProfile | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)

  //* 檢查使用者名稱是否已存在
  const checkUsernameExists = useCallback(
    async (username: string): Promise<boolean> => {
      try {
        const q = query(
          collection(db, 'users'),
          where('username', '==', username)
        )
        const querySnapshot = await getDocs(q)
        return !querySnapshot.empty
      } catch (error) {
        console.error('檢查使用者名稱時發生錯誤:', error)
        throw error
      }
    },
    []
  )

  //* 從 Firestore 獲取使用者資料
  const getUserProfile = useCallback(
    async (uid: string): Promise<UserProfile | null> => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          return processFirestoreDoc<UserProfile>(data)
        }
        return null
      } catch (error) {
        console.error('獲取使用者資料時發生錯誤:', error)
        return null
      }
    },
    []
  )

  //* 從 username 獲取使用者資料
  const getUserProfileByUsername = async (
    username: string
  ): Promise<UserProfile | null> => {
    try {
      const q = query(
        collection(db, 'users'),
        where('username', '==', username)
      )
      const querySnapshot = await getDocs(q)
      if (querySnapshot.empty) {
        return null
      }
      const userDoc = querySnapshot.docs[0]
      const data = userDoc.data()
      return processFirestoreDoc<UserProfile>(data)
    } catch (error) {
      console.error('從 username 獲取使用者資料時發生錯誤:', error)
      return null
    }
  }

  //* 創建使用者資料到 Firestore
  const createUserProfile = useCallback(
    async (firebaseUser: User, additionalData: Partial<UserProfile>) => {
      try {
        const userProfile = createDefaultUserProfile(
          firebaseUser,
          additionalData
        )
        await setDoc(doc(db, 'users', firebaseUser.uid), userProfile)
        return userProfile
      } catch (error) {
        console.error('創建使用者資料時發生錯誤:', error)
        throw error
      }
    },
    []
  )

  //* 電子郵件登入
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true)
      const result = await signInWithEmailAndPassword(auth, email, password)
      const userProfile = await getUserProfile(result.user.uid)

      // 更新最後登入時間
      if (userProfile) {
        await setDoc(
          doc(db, 'users', result.user.uid),
          { lastLoginAt: new Date(), updatedAt: new Date() },
          { merge: true }
        )
        userProfile.lastLoginAt = new Date()
      }

      setUser(userProfile)
    } catch (error) {
      console.error('電子郵件登入失敗:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  //* 自動修復孤兒帳號（Firebase Auth 有帳號但 Firestore 沒有資料）
  const _autoRepairOrphanAccount = useCallback(
    async (firebaseUser: User): Promise<UserProfile> => {
      try {
        console.log('偵測到孤兒帳號，正在自動修復...', firebaseUser.uid)

        // 生成預設的使用者名稱（基於 email 或 uid）
        const defaultUsername = firebaseUser.email
          ? firebaseUser.email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '_')
          : `user_${firebaseUser.uid.slice(0, 8)}`

        // 檢查使用者名稱是否已存在，如果存在則加上隨機後綴
        let username = defaultUsername
        let counter = 1
        while (await checkUsernameExists(username)) {
          username = `${defaultUsername}_${counter}`
          counter++
        }

        // 創建使用者資料
        const userProfile = await createUserProfile(firebaseUser, {
          username,
          displayName: firebaseUser.displayName || username,
          photoURL:
            firebaseUser.photoURL || '/assets/image/userEmptyAvatar.png',
          provider: 'google',
        })

        console.log('孤兒帳號修復完成:', userProfile.username)
        return userProfile
      } catch (error) {
        console.error('自動修復孤兒帳號失敗:', error)
        throw new Error('帳號資料同步失敗，請聯繫管理員')
      }
    },
    [checkUsernameExists, createUserProfile]
  )

  //* Google 登入（修復版本）
  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const result = await signInWithPopup(auth, googleProvider)

      // 檢查是否為新使用者
      let userProfile = await getUserProfile(result.user.uid)

      if (!userProfile) {
        // 嘗試自動修復孤兒帳號
        try {
          userProfile = await _autoRepairOrphanAccount(result.user)
        } catch (repairError) {
          // 如果自動修復失敗，則要求完成註冊流程
          console.error('自動修復失敗，需要手動註冊:', repairError)
          throw new Error('NEW_USER_NEEDS_REGISTRATION')
        }
      }

      // 更新最後登入時間
      if (userProfile) {
        await setDoc(
          doc(db, 'users', result.user.uid),
          { lastLoginAt: new Date(), updatedAt: new Date() },
          { merge: true }
        )
        userProfile.lastLoginAt = new Date()
      }

      setUser(userProfile)
    } catch (error) {
      console.error('Google 登入失敗:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  //* 註冊新使用者
  const register = async (data: RegisterFormData) => {
    try {
      setLoading(true)

      // 檢查使用者名稱是否已存在
      const usernameExists = await checkUsernameExists(data.username)
      if (usernameExists) {
        throw new Error('使用者名稱已存在')
      }

      let firebaseUser: User

      if (data.email && data.password) {
        // 電子郵件註冊
        const result = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        )
        firebaseUser = result.user
      } else {
        // Google 註冊（已經通過 Google 登入）
        if (!auth.currentUser) {
          throw new Error('請先完成 Google 登入')
        }
        firebaseUser = auth.currentUser
      }

      // 創建使用者資料
      const userProfile = await createUserProfile(firebaseUser, {
        username: data.username,
        displayName: data.displayName,
        photoURL:
          data.photoURL ||
          firebaseUser.photoURL ||
          '/assets/image/userEmptyAvatar.png',
        provider: data.email ? 'email' : 'google',
      })

      setUser(userProfile)
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
      await firebaseSignOut(auth)
      setUser(null)
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
      const updatePayload = {
        ...updateData,
        updatedAt: new Date(),
      }

      await setDoc(doc(db, 'users', uid), updatePayload, { merge: true })

      // 如果更新的是當前使用者，同步更新本地狀態
      if (user && user.uid === uid) {
        setUser({ ...user, ...updatePayload })
      }
    } catch (error) {
      console.error('更新使用者資料時發生錯誤:', error)
      throw error
    }
  }

  //* 搜尋使用者
  const searchUsers = async (searchTerm: string, limit: number = 10) => {
    try {
      // 這裡可以實作更複雜的搜尋邏輯
      // 目前先用簡單的 username 搜尋
      const q = query(
        collection(db, 'users'),
        where('username', '>=', searchTerm),
        where('username', '<=', searchTerm + '\uf8ff')
      )
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
        .slice(0, limit)
    } catch (error) {
      console.error('搜尋使用者時發生錯誤:', error)
      return []
    }
  }

  /**
   * 權限檢查方法
   * @param feature 功能
   * @param action 操作
   * @returns 是否具有權限
   */
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

  // const isAdmin = (): boolean => {
  //   return user?.role === 'admin' || user?.role === 'super_admin'
  // }

  // const isSuperAdmin = (): boolean => {
  //   return user?.role === 'super_admin'
  // }

  //* 檢查是否為超級管理員（基於環境變數）
  const checkSuperAdmin = useCallback((firebaseUser: User | null): boolean => {
    if (!firebaseUser?.email) return false
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
    return firebaseUser.email === adminEmail
  }, [])

  //* 監聽認證狀態變化
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentFirebaseUser) => {
        setFirebaseUser(currentFirebaseUser)

        if (currentFirebaseUser) {
          let userProfile = await getUserProfile(currentFirebaseUser.uid)

          // 如果 Firebase Auth 有帳號但 Firestore 沒有資料，嘗試自動修復
          if (!userProfile) {
            try {
              console.log(
                '偵測到孤兒帳號，嘗試自動修復...',
                currentFirebaseUser.uid
              )
              userProfile = await _autoRepairOrphanAccount(currentFirebaseUser)
            } catch (error) {
              console.error('自動修復孤兒帳號失敗:', error)
              // 如果自動修復失敗，設定為 null，讓使用者重新註冊
              userProfile = null
            }
          }

          setUser(userProfile)

          // 檢查超級管理員權限（基於環境變數）
          const isSuperAdminUser = checkSuperAdmin(currentFirebaseUser)
          setIsSuperAdmin(isSuperAdminUser)

          // 檢查一般管理員權限
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
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [getUserProfile, _autoRepairOrphanAccount, checkSuperAdmin])

  const value: AuthContextType = {
    user,
    firebaseUser,
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
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
