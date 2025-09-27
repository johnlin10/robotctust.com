'use client'

import React, { useState, useEffect } from 'react'
import { AuthModal } from '../components/Auth/AuthModal'
import { useAuth } from '../contexts/AuthContext'
import styles from './User.module.scss'
import { useRouter } from 'next/navigation'

export default function User() {
  const { user } = useAuth()
  const router = useRouter()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  useEffect(() => {
    if (user) {
      router.push(`/user/${user.username}`)
    }
  }, [user, router])

  const handleCloseModal = () => {
    setIsAuthModalOpen(false)
  }

  const handleOpenLogin = () => {
    setIsAuthModalOpen(true)
    setAuthMode('login')
  }

  const handleOpenRegister = () => {
    setIsAuthModalOpen(true)
    setAuthMode('register')
  }

  return (
    <div className={`page`}>
      <div className={`page-container ${styles.user}`}>
        {!user && (
          <div className={styles.user_login}>
            <div className={styles.button_container}>
              <button
                className={styles.user_login_button}
                onClick={handleOpenLogin}
              >
                登入
              </button>
              <button
                className={styles.user_register_button}
                onClick={handleOpenRegister}
              >
                註冊
              </button>
            </div>
          </div>
        )}
      </div>
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={handleCloseModal}
          initialMode={authMode}
        />
      )}
    </div>
  )
}
