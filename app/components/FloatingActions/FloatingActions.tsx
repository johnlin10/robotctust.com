'use client'

import { useState, useEffect } from 'react'
import styles from './FloatingActions.module.scss'
// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
// contexts
import { useHeaderState } from '@/app/contexts/HeaderContext'

interface FloatingActionsProps {
  align?: 'right' | 'center' | 'left'
  position?: 'top' | 'bottom'
  actions?: ActionItem[]
  offset?: OffsetConfig
  className?: string
  showBackground?: boolean
  zIndex?: number
}

interface ActionItem {
  // 圖標
  icon: IconProp
  // 文字
  label: string
  // 文字是否顯示
  labelVisible: boolean
  // 點擊事件
  onClick?: () => void
  // 變體
  variant?: 'normal' | 'primary' | 'danger'
  // 點擊後的圖標和文字
  clicked?: {
    icon?: IconProp
    label?: string
  }
  // 是否禁用
  disabled?: boolean

  link?: string
  linkTarget?: '_blank' | '_self'
  linkDataApp?: string
}

interface OffsetConfig {
  top?: string | number
  bottom?: string | number
  left?: string | number
  right?: string | number
}

export default function FloatingActions({
  align = 'center',
  position = 'bottom',
  actions = [],
  offset,
  className = '',
  showBackground = false,
  zIndex = 1000,
}: FloatingActionsProps) {
  const { isCompactHeader } = useHeaderState()
  const [clickedAction, setClickedAction] = useState<boolean>(false)
  const [isContainerHovered, setIsContainerHovered] = useState<boolean>(false)
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false)
  const actionCount = actions.length

  useEffect(() => {
    // 多因素確認是否為觸控裝置
    const checkTouchDevice = window.matchMedia('(pointer: coarse)').matches

    setIsTouchDevice(checkTouchDevice)
  }, [])

  const dynamicStyles: React.CSSProperties = {
    ...(offset?.top && {
      top: typeof offset.top === 'number' ? `${offset.top}px` : offset.top,
    }),
    ...(offset?.bottom && {
      bottom:
        typeof offset.bottom === 'number'
          ? `${offset.bottom}px`
          : offset.bottom,
    }),
    ...(offset?.left && {
      left: typeof offset.left === 'number' ? `${offset.left}px` : offset.left,
    }),
    ...(offset?.right && {
      right:
        typeof offset.right === 'number' ? `${offset.right}px` : offset.right,
    }),
    ...(zIndex && { zIndex }),
  }

  const containerClasses = [
    styles.floatingActions,
    styles[align],
    styles[position],
    isCompactHeader ? styles.isCompactHeader : '',
    showBackground ? styles.showBackground : '',
    actionCount <= 1 ? styles.singleAction : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const handleActionClick = (action: ActionItem) => {
    if (action.disabled && !action.onClick) return

    // 非 compact header 模式
    if (!isCompactHeader || (isCompactHeader && !isTouchDevice)) {
      action.onClick?.()
      setClickedAction(true)
      setTimeout(() => {
        setClickedAction(false)
      }, 3000)
      return
    }

    if (!isContainerHovered) return

    if (isTouchDevice) {
      action.onClick?.()
      setClickedAction(true)
      setTimeout(() => {
        setClickedAction(false)
      }, 3000)
    } else {
      action.onClick?.()
      setClickedAction(true)
      setTimeout(() => {
        setClickedAction(false)
      }, 3000)
    }
  }

  const handleContainerMouseEnter = () => {
    setIsContainerHovered(true)
  }
  const handleContainerMouseLeave = () => {
    setIsContainerHovered(false)
  }

  if (!actions.length) {
    return null
  }

  return (
    <div
      className={containerClasses}
      style={dynamicStyles}
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
      {actions.map((action, index) => (
        <button
          key={`${action.label}-${index}`}
          className={`${styles.actionButton} ${
            action.variant ? styles[action.variant] : ''
          }`}
          onClick={() => handleActionClick(action)}
          disabled={action.disabled}
          title={action.label}
        >
          <FontAwesomeIcon
            icon={
              clickedAction && action.clicked?.icon
                ? action.clicked?.icon
                : action.icon
            }
          />
          {action.labelVisible && (
            <span className={styles.actionLabel}>
              {clickedAction && action.clicked?.label
                ? action.clicked?.label
                : action.label}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
