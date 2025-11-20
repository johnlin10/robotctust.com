'use client'

import { useState, useEffect, ReactNode } from 'react'
import styles from './FloatingActionBar.module.scss'
// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
// contexts
import { useHeaderState } from '@/app/contexts/HeaderContext'

//* ========== 介面定義 ==========

export interface FloatingActionBarProps {
  align?: 'right' | 'center' | 'left'
  position?: 'top' | 'bottom'
  actions?: ActionItem[]
  offset?: OffsetConfig
  className?: string
  showBackground?: boolean
  zIndex?: number
}

/**
 * Action 基礎屬性
 */
interface BaseActionProps {
  // 變體
  variant?: 'normal' | 'primary' | 'danger'
  // 是否禁用
  disabled?: boolean
  // className
  className?: string
}

/**
 * Button Action - 帶有 onClick 事件的按鈕
 */
interface ButtonAction extends BaseActionProps {
  type: 'button'
  // 圖標
  icon: IconProp
  // 標題（懸浮提示）
  title?: string
  // 文字標籤
  label: string
  // 文字是否顯示
  labelVisible?: boolean
  // 點擊事件
  onClick: () => void | Promise<void>
  // 點擊後的視覺回饋
  clicked?: {
    icon?: IconProp
    label?: string
    duration?: number // 顯示時長（毫秒），預設 3000
  }
}

/**
 * Link Action - 帶有 href 的連結
 */
interface LinkAction extends BaseActionProps {
  type: 'link'
  // 圖標
  icon: IconProp
  // 標題（懸浮提示）
  title?: string
  // 文字標籤
  label: string
  // 文字是否顯示
  labelVisible?: boolean
  // 連結
  href: string
  // 連結目標
  target?: '_blank' | '_self'
  // 點擊回調（可選）
  onClick?: () => void | Promise<void>
}

/**
 * Custom Action - 自訂組件
 */
interface CustomAction extends BaseActionProps {
  type: 'custom'
  // 自訂渲染函數
  render: (props: CustomActionRenderProps) => ReactNode
}

/**
 * 自訂 Action 的渲染屬性
 */
export interface CustomActionRenderProps {
  // 是否為 compact header 模式
  isCompactHeader: boolean
  // 是否為觸控裝置
  isTouchDevice: boolean
  // 容器是否被懸浮
  isContainerHovered: boolean
}

/**
 * Action Item 聯合類型
 */
export type ActionItem = ButtonAction | LinkAction | CustomAction

interface OffsetConfig {
  top?: string | number
  bottom?: string | number
  left?: string | number
  right?: string | number
}

//* ========== 主要組件 ==========

export default function FloatingActionBar({
  align = 'center',
  position = 'bottom',
  actions = [],
  offset,
  className = '',
  showBackground = false,
  zIndex = 1000,
}: FloatingActionBarProps) {
  const { isCompactHeader } = useHeaderState()

  // 初始動畫渲染狀態
  const [initialRender, setInitialRender] = useState<boolean>(true)
  // 每個 action 的 clicked 狀態（使用 index 作為 key）
  const [clickedStates, setClickedStates] = useState<Record<number, boolean>>(
    {}
  )
  // 容器懸浮狀態
  const [isContainerHovered, setIsContainerHovered] = useState<boolean>(false)
  // 是否為觸控裝置
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false)

  const actionCount = actions.length

  // 初始化動畫
  useEffect(() => {
    if (initialRender) {
      setInitialRender(false)
    }
  }, [initialRender])

  // 檢測是否為觸控裝置
  useEffect(() => {
    const checkTouchDevice = () => {
      if (typeof window === 'undefined') return false

      // 多因素確認是否為觸控裝置
      const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches
      const hasTouchPoints =
        'maxTouchPoints' in navigator && navigator.maxTouchPoints > 0
      const hasTouchEvent = 'ontouchstart' in window

      return hasCoarsePointer || hasTouchPoints || hasTouchEvent
    }

    setIsTouchDevice(checkTouchDevice())
  }, [])

  const dynamicStyles: React.CSSProperties = {
    ...(offset?.top && {
      top:
        typeof offset.top === 'number'
          ? isCompactHeader
            ? `calc(var(--header-height-compact) + ${offset.top}px) !important`
            : `calc(var(--header-height) + ${offset.top}px) !important`
          : offset.top,
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

  //* ========== 樣式計算 ==========

  const containerClasses = [
    initialRender ? styles.initialRender : '',
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

  //* ========== 事件處理 ==========

  /**
   * 設置 action 的 clicked 狀態
   */
  const setActionClicked = (index: number, duration: number = 3000) => {
    setClickedStates((prev) => ({ ...prev, [index]: true }))

    setTimeout(() => {
      setClickedStates((prev) => ({ ...prev, [index]: false }))
    }, duration)
  }

  /**
   * 處理 button action 點擊
   */
  const handleButtonClick = async (action: ButtonAction, index: number) => {
    if (action.disabled) return

    // 在 compact header 模式且為觸控裝置時，需要先懸浮才能點擊
    if (isCompactHeader && isTouchDevice && !isContainerHovered) {
      return
    }

    try {
      await action.onClick()

      // 如果有 clicked 回饋配置，顯示回饋
      if (action.clicked) {
        const duration = action.clicked.duration ?? 3000
        setActionClicked(index, duration)
      }
    } catch (error) {
      console.error('Action onClick error:', error)
    }
  }

  /**
   * 處理 link action 點擊
   */
  const handleLinkClick = async (action: LinkAction) => {
    if (action.disabled) return

    // 在 compact header 模式且為觸控裝置時，需要先懸浮才能點擊
    if (isCompactHeader && isTouchDevice && !isContainerHovered) {
      return
    }

    try {
      await action.onClick?.()
    } catch (error) {
      console.error('Link onClick error:', error)
    }
  }

  /**
   * 容器懸浮事件
   */
  const handleContainerMouseEnter = () => {
    setTimeout(() => {
      setIsContainerHovered(true)
      console.log('Container hovered')
    }, 100)
  }

  const handleContainerMouseLeave = () => {
    setIsContainerHovered(false)
    console.log('Container unhovered')
  }

  //* ========== 渲染函數 ==========

  /**
   * 渲染 Button Action
   */
  const renderButtonAction = (action: ButtonAction, index: number) => {
    const isClicked = clickedStates[index] ?? false
    const showLabel = action.labelVisible ?? true

    // 當 clicked 狀態時，顯示 clicked 的內容
    const displayIcon =
      isClicked && action.clicked?.icon ? action.clicked.icon : action.icon
    const displayLabel =
      isClicked && action.clicked?.label ? action.clicked.label : action.label

    const buttonClasses = [
      styles.actionButton,
      action.variant ? styles[action.variant] : '',
      !showLabel ? styles.noLabel : '',
      action.className || '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        key={`button-${index}`}
        className={buttonClasses}
        onClick={() => handleButtonClick(action, index)}
        disabled={action.disabled}
        title={action.title ?? action.label}
      >
        <FontAwesomeIcon icon={displayIcon} />
        {showLabel && (
          <span className={styles.actionLabel}>{displayLabel}</span>
        )}
      </button>
    )
  }

  /**
   * 渲染 Link Action
   */
  const renderLinkAction = (action: LinkAction, index: number) => {
    const showLabel = action.labelVisible ?? true

    const linkClasses = [
      styles.actionButton,
      action.variant ? styles[action.variant] : '',
      !showLabel ? styles.noLabel : '',
      action.disabled ? styles.disabled : '',
      action.className || '',
    ]
      .filter(Boolean)
      .join(' ')

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (
        action.disabled ||
        (isCompactHeader && isTouchDevice && !isContainerHovered)
      ) {
        e.preventDefault()
        return
      }
      handleLinkClick(action)
    }

    return (
      <a
        key={`link-${index}`}
        className={linkClasses}
        href={action.disabled ? undefined : action.href}
        target={action.target ?? '_blank'}
        rel={action.target === '_blank' ? 'noopener noreferrer' : undefined}
        title={action.title ?? action.label}
        onClick={handleClick}
        aria-disabled={action.disabled}
      >
        <FontAwesomeIcon icon={action.icon} />
        {showLabel && (
          <span className={styles.actionLabel}>{action.label}</span>
        )}
      </a>
    )
  }

  /**
   * 渲染 Custom Action
   */
  const renderCustomAction = (action: CustomAction, index: number) => {
    const customClasses = [
      styles.actionButton,
      styles.customAction,
      action.variant ? styles[action.variant] : '',
      action.disabled ? styles.disabled : '',
      action.className || '',
    ]
      .filter(Boolean)
      .join(' ')

    const customRenderProps: CustomActionRenderProps = {
      isCompactHeader,
      isTouchDevice,
      isContainerHovered,
    }

    return (
      <div
        key={`custom-${index}`}
        className={customClasses}
        aria-disabled={action.disabled}
      >
        {action.render(customRenderProps)}
      </div>
    )
  }

  /**
   * 根據 action 類型渲染對應的組件
   */
  const renderAction = (action: ActionItem, index: number) => {
    switch (action.type) {
      case 'button':
        return renderButtonAction(action, index)
      case 'link':
        return renderLinkAction(action, index)
      case 'custom':
        return renderCustomAction(action, index)
      default:
        // TypeScript 會確保這裡不會被執行到
        return null
    }
  }

  //* ========== 主要渲染 ==========

  if (!actions.length) {
    return null
  }

  return (
    <>
      <div
        className={containerClasses}
        style={dynamicStyles}
        onMouseEnter={handleContainerMouseEnter}
        onMouseLeave={handleContainerMouseLeave}
      >
        {actions.map((action, index) => renderAction(action, index))}
      </div>

      <div
        className={`${styles.gradient_blur}${
          isCompactHeader ? ` ${styles.compact}` : ''
        }${position === 'bottom' ? ` ${styles.bottom}` : ''}`}
      >
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div className={styles.gradient_background}></div>
      </div>
    </>
  )
}
