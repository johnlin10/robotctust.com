import { requireDashboardAccess } from '@/app/utils/dashboard/auth'
import NewsEditorClient from '../NewsEditorClient'

export const metadata = { title: '新建文章 | Dashboard' }

export default async function NewNewsPage() {
  await requireDashboardAccess('news')
  return <NewsEditorClient />
}
