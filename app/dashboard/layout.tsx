import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import styles from './dashboard.module.scss'

// util
import {
  isDashboardAccessError,
  requireDashboardAccess,
} from '@/app/utils/dashboard/auth'

interface DashboardLayoutProps {
  children: ReactNode
}

/**
 * [Component] 管理後台布局
 * @param children - 子元件
 * @returns 管理後台布局
 */
export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  try {
    // 獲取使用者資料，確保有進入後台的權限
    await requireDashboardAccess()

    // 返回管理後台布局
    return (
      <main className={styles.container}>
        {children}
      </main>
    )
  } catch (error) {
    if (isDashboardAccessError(error) && error.statusCode === 401) {
      redirect('/login')
    }

    redirect('/')
  }
}
