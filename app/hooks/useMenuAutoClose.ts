'use client'

import { useEffect, useCallback, useRef } from 'react'

interface UseMenuAutoCloseOptions {
  isOpen: boolean
  onClose: () => void
  excludeSelectors?: string[]
  touchThreshold?: number
}

/**
 * 自動關閉選單的 Hook
 * 支援點擊外部區域和觸控滑動手勢來關閉選單
 *
 * @param options 配置選項
 * @returns void
 */
export const useMenuAutoClose = ({
  isOpen,
  onClose,
  excludeSelectors = [],
  touchThreshold = 50,
}: UseMenuAutoCloseOptions) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const isClosingRef = useRef(false)

  /**
   * 檢查元素是否在排除列表中
   * @param element 要檢查的元素
   * @returns boolean
   */
  const isExcludedElement = useCallback(
    (element: Element): boolean => {
      // 檢查是否為選單本身或其子元素
      if (element.closest('[data-menu]')) {
        return true
      }

      // 檢查自定義排除選擇器
      return excludeSelectors.some((selector) => {
        try {
          return element.matches(selector) || element.closest(selector)
        } catch (error) {
          console.warn(`Invalid selector: ${selector}`, error)
          return false
        }
      })
    },
    [excludeSelectors]
  )

  /**
   * 處理點擊事件
   * @param event 點擊事件
   */
  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (!isOpen || isClosingRef.current) return

      const target = event.target as Element
      if (!target || isExcludedElement(target)) return

      // 防止重複觸發
      isClosingRef.current = true
      onClose()

      // 重置標記
      setTimeout(() => {
        isClosingRef.current = false
      }, 100)
    },
    [isOpen, onClose, isExcludedElement]
  )

  /**
   * 處理觸控開始事件
   * @param event 觸控事件
   */
  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (!isOpen) return

      const touch = event.touches[0]
      if (!touch) return

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      }
    },
    [isOpen]
  )

  /**
   * 處理觸控結束事件
   * @param event 觸控事件
   */
  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (!isOpen || isClosingRef.current || !touchStartRef.current) return

      const touch = event.changedTouches[0]
      if (!touch) return

      const target = event.target as Element
      if (!target || isExcludedElement(target)) return

      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      // 如果移動距離小於閾值，視為點擊
      if (distance < touchThreshold) {
        isClosingRef.current = true
        onClose()

        setTimeout(() => {
          isClosingRef.current = false
        }, 100)
      }

      touchStartRef.current = null
    },
    [isOpen, onClose, isExcludedElement, touchThreshold]
  )

  /**
   * 處理 ESC 鍵事件
   * @param event 鍵盤事件
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen || isClosingRef.current) return

      if (event.key === 'Escape') {
        event.preventDefault()
        isClosingRef.current = true
        onClose()

        setTimeout(() => {
          isClosingRef.current = false
        }, 100)
      }
    },
    [isOpen, onClose]
  )

  // 設置事件監聽器
  useEffect(() => {
    if (!isOpen) return

    // 使用 passive 選項優化性能
    const options: AddEventListenerOptions = {
      passive: true,
      capture: true,
    }

    // 延遲添加事件監聽器，避免立即觸發
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClick, options)
      document.addEventListener('touchstart', handleTouchStart, options)
      document.addEventListener('touchend', handleTouchEnd, options)
      document.addEventListener('keydown', handleKeyDown, { capture: true })
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('click', handleClick, { capture: true })
      document.removeEventListener('touchstart', handleTouchStart, {
        capture: true,
      })
      document.removeEventListener('touchend', handleTouchEnd, {
        capture: true,
      })
      document.removeEventListener('keydown', handleKeyDown, { capture: true })
    }
  }, [isOpen, handleClick, handleTouchStart, handleTouchEnd, handleKeyDown])

  // 清理狀態
  useEffect(() => {
    if (!isOpen) {
      touchStartRef.current = null
      isClosingRef.current = false
    }
  }, [isOpen])
}
