import React from 'react'
import { getTranslations } from 'next-intl/server'

// components
import { Aside } from '@/app/components/Aside'
import { faFolderTree } from '@fortawesome/free-solid-svg-icons'

/**
 * [Component] 課程管理側邊欄 (Server Component @aside slot)
 */
export default async function CoursesAdminAsideSlot() {
  const t = await getTranslations('Components.DashboardAside')

  const navItems = [
    {
      href: '/dashboard/courses',
      label: t('items.courseOverview'),
      icon: faFolderTree,
      exact: true,
    },
  ]

  return (
    <Aside
      header={{
        title: t('modules.courses'),
        backLink: { href: '/dashboard', label: t('backToModules') },
      }}
      items={navItems}
    />
  )
}
