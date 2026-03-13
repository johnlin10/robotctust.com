'use client'

import React, { useEffect, useState } from 'react'
import styles from './Toast.module.scss'

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faExclamationCircle,
  faInfoCircle,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

/**
 * [Component] Toast 元件
 * @param {ToastProps} message - 訊息
 * @param {ToastType} type - 類型
 * @param {number} duration - 持續時間
 * @param {() => void} onClose - 關閉事件
 * @returns {JSX.Element} Toast 元件
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  duration = 4000,
  onClose,
}) => {
  // 是否正在退出
  const [isExiting, setIsExiting] = useState(false)

  /**
   * [Effect] 設定計時器
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(onClose, 300) // matches animation duration
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  // 圖示
  const icons = {
    success: faCheckCircle,
    error: faExclamationCircle,
    info: faInfoCircle,
  }

  return (
    <div
      className={`${styles.toast} ${styles[type]} ${isExiting ? styles.exit : ''}`}
    >
      <div className={styles.icon}>
        <FontAwesomeIcon icon={icons[type]} />
      </div>
      <div className={styles.message}>{message}</div>
      <button
        className={styles.close}
        onClick={() => {
          setIsExiting(true)
          setTimeout(onClose, 300)
        }}
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </div>
  )
}
