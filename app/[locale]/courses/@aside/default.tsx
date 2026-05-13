import { CourseSidebar } from '../components/CourseSidebar/CourseSidebar'
import { getPublishedSemestersTree } from '@/app/utils/courseService'

/**
 * [Component] 課程區側邊欄 (Server Component @aside slot)
 */
export default async function CoursesAsideSlot() {
  const semesters = await getPublishedSemestersTree()

  return <CourseSidebar semesters={semesters} />
}
