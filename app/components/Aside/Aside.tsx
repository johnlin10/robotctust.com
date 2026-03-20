'use client'

import React from 'react'
import { useHeaderState } from '@/app/contexts/HeaderContext'
import useStickyDetection from '@/app/hooks/useStickyDetection'
import styles from './Aside.module.scss'

interface AsideProps {
  children: React.ReactNode
  className?: string
  topOffset?: number
}

export const Aside: React.FC<AsideProps> = ({
  children,
  className = '',
  topOffset = 60,
}) => {
  const { isCompactHeader } = useHeaderState()
  const stickyState = useStickyDetection({
    topOffset,
    enabled: true,
  })

  return (
    <aside
      ref={stickyState.ref}
      className={`${styles.aside} ${
        isCompactHeader ? styles.headerCompact : ''
      } ${stickyState.isSticky ? styles.sticky : ''} ${className}`}
    >
      {children}
    </aside>
  )
}
