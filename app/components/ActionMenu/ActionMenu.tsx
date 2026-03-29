'use client'

import React, { useState, useRef, useEffect, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons'
import styles from './ActionMenu.module.scss'

interface ActionMenuProps {
  className?: string
  triggerClassName?: string
  children: ReactNode
  ariaLabel?: string
}

export default function ActionMenu({
  className,
  triggerClassName,
  children,
  ariaLabel = '更多操作',
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState<{
    top: number
    left: number
  } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    function handleScroll() {
      if (isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll, { capture: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, { capture: true })
      window.removeEventListener('resize', handleScroll)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setMenuPosition(null)
      return
    }

    if (buttonRef.current && menuRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const menuRect = menuRef.current.getBoundingClientRect()

      let top = buttonRect.bottom
      let left = buttonRect.right - menuRect.width

      // Avoid right edge
      if (left < 0) {
        left = 8
      }
      if (left + menuRect.width > window.innerWidth) {
        left = window.innerWidth - menuRect.width - 8
      }

      // Avoid bottom edge
      if (top + menuRect.height > window.innerHeight) {
        top = buttonRect.top - menuRect.height - 4
      } else {
        top = top + 4
      }

      setMenuPosition({ top, left })
    }
  }, [isOpen])

  return (
    <div className={`${styles.container}${className ? ` ${className}` : ''}`}>
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.triggerButton}${triggerClassName ? ` ${triggerClassName}` : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setIsOpen((prev) => !prev)
        }}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
      >
        <FontAwesomeIcon icon={faEllipsis} />
      </button>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            className={styles.menuDropdown}
            style={{
              position: 'fixed',
              top: menuPosition ? `${menuPosition.top}px` : 0,
              left: menuPosition ? `${menuPosition.left}px` : 0,
              zIndex: 9999,
              opacity: menuPosition ? 1 : 0,
              pointerEvents: menuPosition ? 'auto' : 'none',
            }}
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
            }}
          >
            {children}
          </div>,
          document.body,
        )}
    </div>
  )
}
