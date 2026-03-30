import { requireDashboardAccess } from '@/app/utils/dashboard/auth'
import CourseWorkspaceClient from './CourseWorkspaceClient'

interface DashboardCourseWorkspacePageProps {
  params: Promise<{
    courseId: string
  }>
}

export default async function DashboardCourseWorkspacePage({
  params,
}: DashboardCourseWorkspacePageProps) {
  await requireDashboardAccess('courses')
  const { courseId } = await params

  return <CourseWorkspaceClient courseId={courseId} />
}
