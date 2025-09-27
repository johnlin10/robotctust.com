'use client'

import { useTheme } from '../contexts/ThemeContext'
import { useEffect, useState } from 'react'

export default function ThemeColorMeta() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 避免 hydration 錯誤
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // 定義不同主題對應的顏色（備用選項）
    const fallbackThemeColors = {
      light: '#ffffff', // 淺色主題的背景色
      dark: 'oklch(0.2 0.03 300)', // 深色主題的背景色 (gray-900)
    } as const

    // 嘗試從 CSS 變數獲取顏色，否則使用備用顏色
    const currentColor =
      fallbackThemeColors[resolvedTheme as keyof typeof fallbackThemeColors] ||
      fallbackThemeColors.light

    // 更新或創建 theme-color meta 標籤
    const updateThemeColor = (color: string) => {
      let metaThemeColor = document.querySelector(
        'meta[name="theme-color"]'
      ) as HTMLMetaElement

      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', color)
      } else {
        metaThemeColor = document.createElement('meta')
        metaThemeColor.setAttribute('name', 'theme-color')
        metaThemeColor.setAttribute('content', color)
        document.head.appendChild(metaThemeColor)
      }
    }

    // 設置主題顏色
    updateThemeColor(currentColor)

    // 同時更新 manifest.json 中的 theme_color（如果存在）
    const manifestLink = document.querySelector(
      'link[rel="manifest"]'
    ) as HTMLLinkElement
    if (manifestLink) {
      // 這裡可以動態更新 manifest，但通常不需要
    }
  }, [resolvedTheme, mounted])

  // 這個組件不渲染任何視覺內容
  return null
}
