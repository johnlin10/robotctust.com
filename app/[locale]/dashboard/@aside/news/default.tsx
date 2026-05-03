import { Aside } from '@/app/components/Aside'
import { faList, faPlus } from '@fortawesome/free-solid-svg-icons'

/**
 * [Component] 新聞管理側邊欄 (Server Component @aside slot)
 */
export default function NewsAdminAsideSlot() {
  const navItems = [
    {
      href: '/dashboard/news',
      label: '文章列表',
      icon: faList,
      exact: true,
    },
    {
      href: '/dashboard/news/new',
      label: '新建文章',
      icon: faPlus,
    },
  ]

  return (
    <Aside
      header={{
        title: '新聞管理',
        backLink: { href: '/dashboard', label: '返回模組總覽' },
      }}
      items={navItems}
    />
  )
}
