'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
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
import {
  AuthContextType,
  UserProfile,
  RegisterFormData,
  DEFAULT_USER_PERMISSIONS,
  UserPermissions,
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
  const checkUsernameExists = async (username: string): Promise<boolean> => {
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
  }

  //* 從 Firestore 獲取使用者資料
  const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        return {
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as UserProfile
      }
      return null
    } catch (error) {
      console.error('獲取使用者資料時發生錯誤:', error)
      return null
    }
  }

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
      return {
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as UserProfile
    } catch (error) {
      console.error('從 username 獲取使用者資料時發生錯誤:', error)
      return null
    }
  }

  //* 創建使用者資料到 Firestore
  const createUserProfile = async (
    firebaseUser: User,
    additionalData: Partial<UserProfile>
  ) => {
    try {
      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        username: additionalData.username || '',
        displayName: additionalData.displayName || '',
        photoURL:
          additionalData.photoURL || '/assets/image/userEmptyAvatar.png',
        provider: additionalData.provider || 'email',
        role: 'user', // 預設為一般用戶
        permissions: DEFAULT_USER_PERMISSIONS, // 預設權限
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile)
      return userProfile
    } catch (error) {
      console.error('創建使用者資料時發生錯誤:', error)
      throw error
    }
  }

  //* 電子郵件登入
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true)
      const result = await signInWithEmailAndPassword(auth, email, password)
      const userProfile = await getUserProfile(result.user.uid)
      setUser(userProfile)
    } catch (error) {
      console.error('電子郵件登入失敗:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  //* Google 登入
  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const result = await signInWithPopup(auth, googleProvider)

      // 檢查是否為新使用者
      const userProfile = await getUserProfile(result.user.uid)

      if (!userProfile) {
        // 新使用者，需要完成註冊流程
        throw new Error('NEW_USER_NEEDS_REGISTRATION')
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
  const checkSuperAdmin = (firebaseUser: User | null): boolean => {
    if (!firebaseUser?.email) return false
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
    return firebaseUser.email === adminEmail
  }

  //* 監聽認證狀態變化
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentFirebaseUser) => {
        setFirebaseUser(currentFirebaseUser)

        if (currentFirebaseUser) {
          const userProfile = await getUserProfile(currentFirebaseUser.uid)
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
  }, [])

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
    hasPermission,
    isAdmin,
    isSuperAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
