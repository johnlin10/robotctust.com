'use client'

import { useEffect, useRef } from 'react'
import styles from './MouseDynamicGlow.module.scss'

/**
 * [Component] 滑鼠動態光暈效果
 * 使用 requestAnimationFrame 進行節流，優化性能
 */
export default function MouseDynamicGlow() {
  const glowRef = useRef<HTMLDivElement>(null)
  const rafIdRef = useRef<number | null>(null)
  const mousePositionRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    //* 處理滑鼠移動事件（節流）
    const handleMouseMove = (event: MouseEvent) => {
      // 更新滑鼠位置到 ref（不觸發重新渲染）
      mousePositionRef.current = {
        x: event.clientX,
        y: event.clientY,
      }

      // 如果已經有 requestAnimationFrame 在等待，就不重複請求
      if (rafIdRef.current !== null) return

      // 使用 requestAnimationFrame 進行節流
      rafIdRef.current = requestAnimationFrame(() => {
        if (glowRef.current) {
          // 使用 transform 替代 left/top，避免 Layout Shift
          // transform 是 compositor 層級屬性，不會觸發 layout 或 paint
          glowRef.current.style.transform = `translate(calc(${mousePositionRef.current.x}px - 50%), calc(${mousePositionRef.current.y}px - 50%))`
        }
        rafIdRef.current = null
      })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      // 清理未完成的 requestAnimationFrame
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])

  return <div ref={glowRef} className={styles.mouseDynamicGlow}></div>
}
