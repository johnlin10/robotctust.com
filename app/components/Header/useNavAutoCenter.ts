'use client'

import { useCallback, useEffect, useRef } from 'react'
import { NAV_AUTO_CENTER_CONFIG } from './headerScrollConfig'

/**
 * Hook for auto-centering active navigation items in horizontal scrollable container
 * @param activeItemSelector - CSS selector for the active navigation item
 * @param config - Configuration object for auto-centering behavior
 */
export function useNavAutoCenter(
  activeItemSelector: string = '.active',
  config = NAV_AUTO_CENTER_CONFIG
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  //* 將指定元素滾動到容器中央
  const scrollToCenter = useCallback(
    (element: Element) => {
      const container = containerRef.current
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()

      // 計算元素相對於容器的位置
      const elementCenter =
        elementRect.left + elementRect.width / 2 - containerRect.left
      const containerCenter = containerRect.width / 2

      // 計算需要滾動的距離
      const scrollOffset = elementCenter - containerCenter

      // 只有當偏移量超過閾值時才滾動，避免不必要的微調
      if (Math.abs(scrollOffset) > config.SCROLL_OFFSET_THRESHOLD) {
        container.scrollBy({
          left: scrollOffset,
          behavior: 'smooth',
        })
      }
    },
    [config.SCROLL_OFFSET_THRESHOLD]
  )

  //* 找到並居中活躍的導航項目
  const centerActiveItem = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const activeItem = container.querySelector(activeItemSelector)
    if (activeItem) {
      scrollToCenter(activeItem)
    }
  }, [activeItemSelector, scrollToCenter])

  //* 處理點擊事件 - 立即居中
  const handleLinkClick = useCallback(() => {
    // 使用短暫延遲確保 DOM 更新完成
    setTimeout(() => {
      centerActiveItem()
    }, config.CLICK_CENTER_DELAY)
  }, [centerActiveItem, config.CLICK_CENTER_DELAY])

  //* 處理滾動事件 - 延遲自動歸位
  const handleScroll = useCallback(() => {
    // 清除之前的計時器
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    // 設置新的計時器
    scrollTimeoutRef.current = setTimeout(() => {
      centerActiveItem()
    }, config.AUTO_CENTER_DELAY)
  }, [centerActiveItem, config.AUTO_CENTER_DELAY])

  //* 清理計時器
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  //* 監聽路由變化，自動居中新的活躍項目
  useEffect(() => {
    // 路由變化時延遲執行，確保 DOM 完全更新
    const timeoutId = setTimeout(() => {
      centerActiveItem()
    }, config.ROUTE_CENTER_DELAY)

    return () => clearTimeout(timeoutId)
  }, [centerActiveItem, config.ROUTE_CENTER_DELAY])

  return {
    containerRef,
    handleLinkClick,
    handleScroll,
    centerActiveItem,
  }
}
