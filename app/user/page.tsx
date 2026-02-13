import { redirect } from 'next/navigation'

export default function UserPage() {
  redirect('/login')
}

/**
 * TODO(legacy-auth-modal): 保留舊版使用者頁面邏輯以供回溯。
 *
 * 'use client'
 *
 * import React, { useState, useEffect } from 'react'
 * import { AuthModal } from '../components/Auth/AuthModal'
 * import { useAuth } from '../contexts/AuthContext'
 * import styles from './User.module.scss'
 * import { useRouter } from 'next/navigation'
 *
 * export function LegacyUserPage() {
 *   const { user } = useAuth()
 *   const router = useRouter()
 *   const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
 *   const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
 *
 *   useEffect(() => {
 *     if (user) {
 *       router.push(`/user/${user.username}`)
 *     }
 *   }, [user, router])
 *
 *   return (
 *     <div className={`page`}>
 *       <div className={`page-container ${styles.user}`}>
 *         {!user && (
 *           <div className={styles.user_login}>
 *             <div className={styles.button_container}>
 *               <button
 *                 className={styles.user_login_button}
 *                 onClick={() => {
 *                   setIsAuthModalOpen(true)
 *                   setAuthMode('login')
 *                 }}
 *               >
 *                 登入
 *               </button>
 *               <button
 *                 className={styles.user_register_button}
 *                 onClick={() => {
 *                   setIsAuthModalOpen(true)
 *                   setAuthMode('register')
 *                 }}
 *               >
 *                 註冊
 *               </button>
 *             </div>
 *           </div>
 *         )}
 *       </div>
 *       {isAuthModalOpen && (
 *         <AuthModal
 *           isOpen={isAuthModalOpen}
 *           onClose={() => setIsAuthModalOpen(false)}
 *           initialMode={authMode}
 *         />
 *       )}
 *     </div>
 *   )
 * }
 */
