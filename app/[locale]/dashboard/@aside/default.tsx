// util
import { requireDashboardAccess } from '@/app/utils/dashboard/auth'
import { DASHBOARD_MODULES } from '@/app/types/dashboard'
import { getUserRoleName } from '@/app/types/user'
import { getTranslations } from 'next-intl/server'

// components
import { Aside } from '@/app/components/Aside'
import { faHouse } from '@fortawesome/free-solid-svg-icons'

/**
 * [Component] 管理後台全域側邊欄 (Server Component @aside slot)
 * 提供返回模組總覽與切換模組的導覽列
 */
export default async function GlobalAsideSlot() {
  const actor = await requireDashboardAccess()
  const t = await getTranslations('Components.DashboardAside')
  const tRoles = await getTranslations('Roles')

  const visibleModules = DASHBOARD_MODULES.filter((module) =>
    actor.modules.includes(module.key),
  )

  const items = [
    { label: t('overview'), href: '/dashboard', icon: faHouse, exact: true },
    ...visibleModules.map((module) => ({
      label: t(`modules.${module.key}` as any),
      href: module.href,
      icon: module.icon ? module.icon : null,
    })),
  ]

  return (
    <Aside
      header={{
        title: t('header.title'),
        subtitle: t('header.subtitle', { role: tRoles(actor.role as any) }),
      }}
      items={items}
    />
  )
}
