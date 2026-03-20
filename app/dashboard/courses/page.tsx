import { requireDashboardAccess } from '@/app/utils/dashboard/auth'
import CourseEditorClient from './CourseEditorClient'

/**
 * 課程編輯器頁面
 * @returns 課程編輯器頁面
 */
export default async function DashboardCoursesPage() {
  // 檢查是否有權限
  await requireDashboardAccess('courses')
  // 返回課程編輯器頁面
  return <CourseEditorClient />
}
