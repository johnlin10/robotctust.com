'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react'

// components
import { Toast, ToastType } from '../components/Toast/Toast'

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
}

// ToastContext
const ToastContext = createContext<ToastContextType | undefined>(undefined)

/**
 * 使用 ToastContext
 * @returns {ToastContextType} ToastContext
 */
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

/**
 * [Component] ToastProvider 元件
 * @param {ReactNode} children - 子元件
 * @returns {JSX.Element} ToastProvider 元件
 */
export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Toast 訊息
  const [toast, setToast] = useState<{
    message: string
    type: ToastType
    duration?: number
  } | null>(null)

  /**
   * 顯示 Toast 訊息
   * @param {string} message - 訊息
   * @param {ToastType} type - 類型
   * @param {number} duration - 持續時間
   * @returns {void}
   */
  const showToast = useCallback(
    (message: string, type: ToastType = 'success', duration?: number) => {
      setToast({ message, type, duration })
    },
    [],
  )

  /**
   * 隱藏 Toast 訊息
   * @returns {void}
   */
  const hideToast = useCallback(() => {
    setToast(null)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  )
}
