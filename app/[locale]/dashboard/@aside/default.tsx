// util
import { requireDashboardAccess } from '@/app/utils/dashboard/auth'
import { DASHBOARD_MODULES } from '@/app/types/dashboard'
import { getUserRoleName } from '@/app/types/user'

// components
import { Aside } from '@/app/components/Aside'
import { faHouse } from '@fortawesome/free-solid-svg-icons'

/**
 * [Component] 管理後台全域側邊欄 (Server Component @aside slot)
 * 提供返回模組總覽與切換模組的導覽列
 */
export default async function GlobalAsideSlot() {
  const actor = await requireDashboardAccess()

  const visibleModules = DASHBOARD_MODULES.filter((module) =>
    actor.modules.includes(module.key),
  )

  const items = [
    { label: '總覽', href: '/dashboard', icon: faHouse, exact: true },
    ...visibleModules.map((module) => ({
      label: module.title,
      href: module.href,
      icon: module.icon ? module.icon : null,
    })),
  ]

  return (
    <Aside
      header={{
        title: '管理後台',
        subtitle: `權限：${getUserRoleName(actor.role)}`,
      }}
      items={items}
    />
  )
}
