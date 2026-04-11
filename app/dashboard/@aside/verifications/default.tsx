import React from 'react'

// components
import { Aside } from '@/app/components/Aside'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'

/**
 * [Component] 課程審核側邊欄 (Server Component @aside slot)
 */
export default function VerificationsAdminAsideSlot() {
  const navItems = [
    { href: '/dashboard/verifications', label: '待審核清單', icon: faCheckCircle },
  ]

  return (
    <Aside
      mode="nav"
      header={{
        title: '課程審核',
        backLink: { href: '/dashboard', label: '返回模組總覽' },
      }}
      items={navItems}
    />
  )
}
