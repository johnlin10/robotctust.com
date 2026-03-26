import { redirect } from 'next/navigation'

/**
 * 舊社員管理入口，轉址到新的帳號管理模組
 */
export default async function DashboardMembersPage() {
  redirect('/dashboard/accounts')
}
