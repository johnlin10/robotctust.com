/**
 * 檢測元素 sticky 狀態的 Hook
 * 使用 Intersection Observer API 來偵測元素是否處於 sticky 狀態
 */

import { useEffect, useState, useRef, RefObject } from 'react'

interface UseStickyDetectionOptions {
  /** sticky 元素的 top 偏移量（與 CSS 中的 top 值相同） */
  topOffset?: number
  /** 是否啟用檢測 */
  enabled?: boolean
}

interface StickyState {
  /** 是否處於 sticky 狀態 */
  isSticky: boolean
  /** sticky 元素的參考 */
  ref: RefObject<HTMLDivElement | null>
}

/**
 * 檢測元素是否處於 sticky 狀態
 * @param options 設定選項
 * @returns sticky 狀態和元素參考
 */
export function useStickyDetection(
  options: UseStickyDetectionOptions = {}
): StickyState {
  const { topOffset = 0, enabled = true } = options
  const [isSticky, setIsSticky] = useState(false)
  const elementRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!enabled || !elementRef.current) {
      return
    }

    const element = elementRef.current
    const parent = element.parentElement

    if (!parent) {
      return
    }

    //* 建立一個 sentinel 元素來檢測 sticky 狀態
    // 這個元素會放在 sticky 元素的上方，當它消失時表示元素變成 sticky
    const sentinel = document.createElement('div')
    sentinel.style.position = 'absolute'
    sentinel.style.top = '0'
    sentinel.style.left = '0'
    sentinel.style.width = '1px'
    sentinel.style.height = '1px'
    sentinel.style.visibility = 'hidden'
    sentinel.style.pointerEvents = 'none'

    // 將 sentinel 插入到 sticky 元素之前
    parent.insertBefore(sentinel, element)

    //* 使用 Intersection Observer 來監聽 sentinel 的可見性
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // 當 sentinel 不可見時，表示 sticky 元素已經 sticky
          const isCurrentlySticky = !entry.isIntersecting
          setIsSticky(isCurrentlySticky)

          //* 觸發自定義事件，類似您提到的 sticky-change 事件
          const stickyEvent = new CustomEvent('sticky-change', {
            detail: {
              target: element,
              stuck: isCurrentlySticky,
            },
          })
          element.dispatchEvent(stickyEvent)
        })
      },
      {
        // 設定根邊距，考慮 sticky 的 top 偏移量
        rootMargin: `-${topOffset}px 0px 0px 0px`,
        threshold: [0, 1],
      }
    )

    observer.observe(sentinel)

    // 清理函數
    return () => {
      observer.disconnect()
      // 修復：增加額外的檢查避免 removeChild 錯誤
      if (sentinel && sentinel.parentNode) {
        try {
          sentinel.parentNode.removeChild(sentinel)
        } catch (error) {
          // 在開發環境中，HMR 可能會導致 DOM 元素已被移除
          // 這種情況下忽略錯誤即可
          console.debug('Sentinel element cleanup skipped:', error)
        }
      }
    }
  }, [topOffset, enabled])

  return {
    isSticky,
    ref: elementRef,
  }
}

export default useStickyDetection
