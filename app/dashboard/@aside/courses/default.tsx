import React from 'react'

// components
import { Aside } from '@/app/components/Aside'
import {
  faBookOpen,
  faCalendarDays,
  faFolderTree,
  faLayerGroup,
} from '@fortawesome/free-solid-svg-icons'

/**
 * [Component] 課程管理側邊欄 (Server Component @aside slot)
 */
export default function CoursesAdminAsideSlot() {
  const navItems = [
    { href: '/dashboard/courses', label: '課程總覽', icon: faFolderTree },
    // {
    //   href: '/dashboard/courses/semesters',
    //   label: '學期管理',
    //   icon: faCalendarDays,
    // },
    // {
    //   href: '/dashboard/courses/chapters',
    //   label: '章節管理',
    //   icon: faLayerGroup,
    // },
    // { href: '/dashboard/courses/csourses', label: '課程列表', icon: faBookOpen },
  ]

  return (
    <Aside
      mode="nav"
      header={{
        title: '課程管理',
        backLink: { href: '/dashboard', label: '返回模組總覽' },
      }}
      items={navItems}
    />
  )
}
