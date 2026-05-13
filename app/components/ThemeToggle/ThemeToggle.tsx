'use client'

import { useTheme } from '../../contexts/ThemeContext'
import { useEffect, useState } from 'react'
import styles from './ThemeToggle.module.scss'
// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDesktop, faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { useTranslations } from 'next-intl'

export default function ThemeToggle() {
  const t = useTranslations('Components.ThemeToggle')
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
    if (theme === 'system') return t('system')
    return resolvedTheme === 'dark' ? t('dark') : t('light')
  }

  return (
    <button
      className={styles.toggle}
      onClick={handleThemeChange}
      aria-label={`${t('switchTo')} ${
        theme === 'light'
          ? t('dark')
          : theme === 'dark'
            ? t('system')
            : t('light')
      } ${t('mode')}`}
      title={`${t('switchTo')} ${
        theme === 'light'
          ? t('dark')
          : theme === 'dark'
            ? t('system')
            : t('light')
      } ${t('mode')}`}
    >
      <span className={styles.icon}>{getIcon()}</span>
      <span className={styles.label}>{getLabel()}</span>
    </button>
  )
}
