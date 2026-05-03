import { redirect } from 'next/navigation'
import AdminPageClient from './AdminPageClient'
import { requireAdminAccess } from '@/app/utils/auth/admin'

export default async function AdminPage() {
  const access = await requireAdminAccess()

  if (access.status === 'unauthenticated') {
    redirect('/login')
  }

  if (access.status === 'forbidden') {
    redirect('/')
  }

  return <AdminPageClient />
}
