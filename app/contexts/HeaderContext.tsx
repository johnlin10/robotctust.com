'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react'
import { HeaderScrollConfig } from '../components/Header/headerScrollConfig'

//* Header Context 介面定義
interface HeaderContextType {
  isCompactHeader: boolean
  // 可以在未來擴展更多 header 相關功能
}

//* Header Provider Props
interface HeaderProviderProps {
  children: ReactNode
  config: HeaderScrollConfig
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined)

/**
 * Header 狀態管理 Provider
 * 管理全域的 header 滾動狀態
 */
export function HeaderProvider({ children, config }: HeaderProviderProps) {
  const [isCompactHeader, setIsCompactHeader] = useState(false)
  const lastScrollY = useRef(0)
  const scrollDirection = useRef<'up' | 'down' | null>(null)
  const accumulatedScrollUp = useRef(0)

  //* 節流函數
  const throttle = useCallback(
    <T extends unknown[]>(func: (...args: T) => void, delay: number) => {
      let timeoutId: NodeJS.Timeout
      let lastExecTime = 0

      return (...args: T) => {
        const currentTime = Date.now()

        if (currentTime - lastExecTime > delay) {
          func(...args)
          lastExecTime = currentTime
        } else {
          clearTimeout(timeoutId)
          timeoutId = setTimeout(() => {
            func(...args)
            lastExecTime = Date.now()
          }, delay - (currentTime - lastExecTime))
        }
      }
    },
    []
  )

  //* 滾動處理邏輯
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY
    const scrollDelta = currentScrollY - lastScrollY.current

    // 忽略微小的滾動變化
    if (Math.abs(scrollDelta) < config.MIN_SCROLL_DELTA) {
      return
    }

    const currentDirection = scrollDelta > 0 ? 'down' : 'up'

    // 向下滾動邏輯
    if (currentDirection === 'down') {
      accumulatedScrollUp.current = 0 // 重置向上滾動累積

      if (currentScrollY > config.SCROLL_DOWN_THRESHOLD && !isCompactHeader) {
        setIsCompactHeader(true)
        document.documentElement.setAttribute('data-compact-header', 'true')
      }
    }

    // 向上滾動邏輯
    if (currentDirection === 'up') {
      // 累積向上滾動距離
      if (scrollDirection.current === 'up') {
        accumulatedScrollUp.current += Math.abs(scrollDelta)
      } else {
        accumulatedScrollUp.current = Math.abs(scrollDelta)
      }

      // 當累積向上滾動達到閾值時，取消緊湊模式
      if (
        accumulatedScrollUp.current >= config.SCROLL_UP_THRESHOLD &&
        isCompactHeader
      ) {
        setIsCompactHeader(false)
        document.documentElement.setAttribute('data-compact-header', 'false')
        accumulatedScrollUp.current = 0
      }
    }

    // 在頁面接近頂部時總是取消緊湊模式
    if (currentScrollY <= config.TOP_RESTORE_THRESHOLD) {
      setIsCompactHeader(false)
      accumulatedScrollUp.current = 0
    }

    scrollDirection.current = currentDirection
    lastScrollY.current = currentScrollY
  }, [config, isCompactHeader])

  //* 節流版本的滾動處理器
  const throttledHandleScroll = useCallback(
    () => throttle(handleScroll, config.THROTTLE_DELAY)(),
    [handleScroll, config.THROTTLE_DELAY, throttle]
  )

  useEffect(() => {
    // 初始化滾動位置
    lastScrollY.current = window.scrollY

    // 添加滾動事件監聽器
    window.addEventListener('scroll', throttledHandleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
    }
  }, [throttledHandleScroll])

  const contextValue: HeaderContextType = {
    isCompactHeader,
  }

  return (
    <HeaderContext.Provider value={contextValue}>
      {children}
    </HeaderContext.Provider>
  )
}

/**
 * 取得 Header 狀態的 Hook
 * 可在任何組件中使用來獲取 header 狀態
 */
export function useHeaderState(): HeaderContextType {
  const context = useContext(HeaderContext)

  if (context === undefined) {
    throw new Error('useHeaderState must be used within a HeaderProvider')
  }

  return context
}

/**
 * 僅取得 isCompactHeader 狀態的簡化 Hook
 * 向下相容原本的 useHeaderScroll
 */
export function useHeaderScroll(): boolean {
  const { isCompactHeader } = useHeaderState()
  return isCompactHeader
}
