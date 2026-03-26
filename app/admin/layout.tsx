import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { requireAdminAccess } from '@/app/utils/auth/admin'

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const access = await requireAdminAccess()

  if (access.status === 'unauthenticated') {
    redirect('/login')
  }

  if (access.status === 'forbidden') {
    redirect('/')
  }

  return <div>{children}</div>
}
