'use client'

import styles from './Menu.module.scss'
// import { useTheme } from 'next-themes'
import ThemeToggle from '../ThemeToggle/ThemeToggle'

interface MenuProps {
  isOpen: boolean
  // onClose: () => void
}

export default function Menu({ isOpen }: MenuProps) {
  // const { theme, setTheme, resolvedTheme } = useTheme()
  return (
    <div className={`${styles.menu} ${isOpen ? styles.open : ''}`}>
      <div className={styles.menu_item}>
        <ThemeToggle />
      </div>
    </div>
  )
}
