'use client'

import { useTheme } from '../../contexts/ThemeContext'
import { useEffect, useState } from 'react'
import styles from './ThemeToggle.module.scss'
// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDesktop, faMoon, faSun } from '@fortawesome/free-solid-svg-icons'

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  //* 避免 hydration 錯誤
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={styles.skeleton} />
  }

  const handleThemeChange = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    if (theme === 'system') {
      return <FontAwesomeIcon icon={faDesktop} />
    }
    return resolvedTheme === 'dark' ? (
      <FontAwesomeIcon icon={faMoon} />
    ) : (
      <FontAwesomeIcon icon={faSun} />
    )
  }

  const getLabel = () => {
    if (theme === 'system') return '系統'
    return resolvedTheme === 'dark' ? '深色' : '淺色'
  }

  return (
    <button
      className={styles.toggle}
      onClick={handleThemeChange}
      aria-label={`切換到${
        theme === 'light' ? '深色' : theme === 'dark' ? '系統' : '淺色'
      }模式`}
      title={`目前：${getLabel()}模式`}
    >
      <span className={styles.icon}>{getIcon()}</span>
      <span className={styles.label}>{getLabel()}</span>
    </button>
  )
}
