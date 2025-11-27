'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  useSpring,
  animated,
  config as springConfig,
  SpringConfig,
} from '@react-spring/web'

// 所有支援的動畫類型
type AnimationType =
  | 'fadeInUp'
  | 'fadeInDown'
  | 'fadeInLeft'
  | 'fadeInRight'
  | 'zoomIn'
  | 'zoomOut'
  | 'blurIn'
  | 'fade'

// 動畫預設值的結構
interface AnimationPreset {
  from: React.CSSProperties | { [key: string]: any }
  to: React.CSSProperties | { [key: string]: any }
}

// 組件 Props
interface ScrollAnimationProps {
  children?: React.ReactNode
  /** 動畫類型 */
  animation?: AnimationType
  /** 位移距離 (px)，預設 40 */
  distance?: number
  /** 動畫延遲 (ms) */
  delay?: number
  /** 自定義動畫持續時間 (ms)，若設定此項則會覆蓋彈簧物理效果 */
  duration?: number
  /** 自定義 CSS 類名 */
  className?: string
  /** IntersectionObserver 的觸發閾值 (0-1) */
  threshold?: number
  /** IntersectionObserver 的邊界偏移 */
  rootMargin?: string
  /** 是否只執行一次動畫，預設為 true */
  once?: boolean
  /** React Spring 的物理配置 */
  config?: SpringConfig
  /** 額外的行內樣式 */
  style?: React.CSSProperties
}

/**
 * [function] 取得動畫樣式
 * @param type 動畫類型
 * @param distance 位移距離
 * @returns 動畫樣式
 */
const getAnimationStyles = (
  type: AnimationType,
  distance: number = 50
): AnimationPreset => {
  const presets: Record<AnimationType, AnimationPreset> = {
    fadeInUp: {
      from: { opacity: 0, y: distance },
      to: { opacity: 1, y: 0 },
    },
    fadeInDown: {
      from: { opacity: 0, y: -distance },
      to: { opacity: 1, y: 0 },
    },
    fadeInLeft: {
      from: { opacity: 0, x: -distance },
      to: { opacity: 1, x: 0 },
    },
    fadeInRight: {
      from: { opacity: 0, x: distance },
      to: { opacity: 1, x: 0 },
    },
    zoomIn: {
      from: { opacity: 0, scale: 0.8 },
      to: { opacity: 1, scale: 1 },
    },
    zoomOut: {
      from: { opacity: 0, scale: 1.2 },
      to: { opacity: 1, scale: 1 },
    },
    blurIn: {
      from: { opacity: 0, filter: 'blur(48px)' },
      to: { opacity: 1, filter: 'blur(0px)' },
    },
    fade: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  }

  return presets[type] || presets['fadeInUp']
}

/**
 * [component] 滾動動畫組件
 * @param children 子元素
 * @param animation 動畫類型
 * @param distance 位移距離
 * @param delay 動畫延遲
 * @param duration 動畫持續時間
 * @param className 自定義 CSS 類名
 * @param threshold 觸發閾值
 * @param rootMargin 邊界偏移
 * @param once 是否只執行一次動畫
 * @param config 物理配置
 * @param config.mass 質量
 * @param config.tension 張力
 * @param config.friction 摩擦力
 * @param style 額外的行內樣式
 * @returns 滾動動畫組件
 */
const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  animation = 'fadeInUp',
  distance = 40,
  delay = 0,
  duration,
  className = '',
  threshold = 0.1,
  rootMargin = '0px 0px -10% 0px',
  once = true,
  config = { mass: 3, tension: 300, friction: 35 },
  style,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const ref = useRef<HTMLDivElement>(null)

  const animationPreset = useMemo(
    () => getAnimationStyles(animation, distance),
    [animation, distance]
  )

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  const springProps = useSpring({
    from: animationPreset.from,
    to: isVisible ? animationPreset.to : animationPreset.from,
    delay,
    config: duration ? { duration, ...springConfig.default } : config,
  })

  return (
    <animated.div
      ref={ref}
      style={{
        willChange: isVisible ? 'transform, opacity' : 'auto',
        contain: 'layout',
        ...style,
        ...springProps,
      }}
      className={className}
    >
      {children}
    </animated.div>
  )
}

export default ScrollAnimation
