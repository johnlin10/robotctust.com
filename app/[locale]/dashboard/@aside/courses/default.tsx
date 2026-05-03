import React from 'react'

// components
import { Aside } from '@/app/components/Aside'
import { faFolderTree } from '@fortawesome/free-solid-svg-icons'

/**
 * [Component] 課程管理側邊欄 (Server Component @aside slot)
 */
export default function CoursesAdminAsideSlot() {
  const navItems = [
    {
      href: '/dashboard/courses',
      label: '課程總覽',
      icon: faFolderTree,
      exact: true,
    },
  ]

  return (
    <Aside
      header={{
        title: '課程管理',
        backLink: { href: '/dashboard', label: '返回模組總覽' },
      }}
      items={navItems}
    />
  )
}
