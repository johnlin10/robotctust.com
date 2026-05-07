import React from 'react'
import { getTranslations } from 'next-intl/server'

// components
import { Aside } from '@/app/components/Aside'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'

/**
 * [Component] 課程審核側邊欄 (Server Component @aside slot)
 */
export default async function VerificationsAdminAsideSlot() {
  const t = await getTranslations('Components.DashboardAside')

  const navItems = [
    {
      href: '/dashboard/verifications',
      label: t('items.pendingVerifications'),
      icon: faCheckCircle,
      exact: true,
    },
  ]

  return (
    <Aside
      header={{
        title: t('modules.verifications'),
        backLink: { href: '/dashboard', label: t('backToModules') },
      }}
      items={navItems}
    />
  )
}
