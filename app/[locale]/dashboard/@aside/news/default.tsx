import { getTranslations } from 'next-intl/server'
import { Aside } from '@/app/components/Aside'
import { faList, faPlus } from '@fortawesome/free-solid-svg-icons'

/**
 * [Component] 新聞管理側邊欄 (Server Component @aside slot)
 */
export default async function NewsAdminAsideSlot() {
  const t = await getTranslations('Components.DashboardAside')

  const navItems = [
    {
      href: '/dashboard/news',
      label: t('items.articleList'),
      icon: faList,
      exact: true,
    },
    {
      href: '/dashboard/news/new',
      label: t('items.newArticle'),
      icon: faPlus,
    },
  ]

  return (
    <Aside
      header={{
        title: t('modules.news'),
        backLink: { href: '/dashboard', label: t('backToModules') },
      }}
      items={navItems}
    />
  )
}
