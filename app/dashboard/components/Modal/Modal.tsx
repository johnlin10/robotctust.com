'use client'

import React, { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import styles from './Modal.module.scss'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: string
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '600px',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.visible : ''}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      tabIndex={-1}
    >
      <div 
        className={`${styles.modal} ${isOpen ? styles.visible : ''}`}
        style={{ maxWidth }}
      >
        <div className={styles.header}>
          <h2>{title}</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="關閉"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.formContent}>
            {children}
          </div>
        </div>

        {footer && (
          <div className={styles.footer}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
