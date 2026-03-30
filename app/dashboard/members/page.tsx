import { Metadata } from 'next'
import { requireDashboardAccess } from '@/app/utils/dashboard/auth'
import MembersClient from './MembersClient'

export const metadata: Metadata = {
  title: '學期名單管理 - 課程後台',
  description: '管理各學期參與課程的社員與學員名單',
}

export default async function MembersPage() {
  await requireDashboardAccess('members')

  return <MembersClient />
}
