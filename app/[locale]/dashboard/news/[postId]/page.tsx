import { requireDashboardAccess } from '@/app/utils/dashboard/auth'
import NewsEditorClient from '../NewsEditorClient'

export const metadata = { title: '編輯文章 | Dashboard' }

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ postId: string }>
}) {
  await requireDashboardAccess('news')
  const { postId } = await params
  return <NewsEditorClient postId={postId} />
}
