'use client'
import { useSpring, animated } from '@react-spring/web'
import { useEffect, useRef, useState } from 'react'

interface FadeInUpProps {
  children: React.ReactNode
  /** 動畫延遲時間 (ms) */
  delay?: number
  /** 自定義樣式類名 */
  className?: string
  /** 觸發動畫的視窗可見度閾值 (0-1) */
  threshold?: number
  /**
   * 觸發動畫的視窗邊界偏移
   * 格式同 CSS margin，例如: "0px 0px -30% 0px"
   * 負值表示向內縮減觸發範圍
   */
  rootMargin?: string
  /** 彈簧動畫的配置 */
  config?: {
    /** 彈簧動畫的質量 (Mass) */
    mass?: number
    /** 彈簧動畫的張力 (Tension) */
    tension?: number
    /** 彈簧動畫的摩擦力 (Friction) */
    friction?: number
  }
}

/**
 * FadeInUp 向上飄入動畫組件
 * 當元素進入視窗時觸發動畫
 */
export const FadeInUp = ({
  children,
  delay = 0,
  className = '',
  threshold = 0.1,
  rootMargin = '0px 0px -10% 0px',
  config = { mass: 1, tension: 280, friction: 25 },
}: FadeInUpProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect() // 動畫只執行一次
        }
      },
      { threshold, rootMargin }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  const styles = useSpring({
    from: { opacity: 0, transform: 'translate3d(0, 40px, 0)' },
    to: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 40px, 0)',
    },
    delay,
    config, // 調整彈簧參數以獲得自然的感覺
  })

  return (
    <animated.div ref={ref} style={styles} className={className}>
      {children}
    </animated.div>
  )
}

export default FadeInUp
