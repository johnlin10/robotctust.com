import { cache } from 'react'
import { createClient } from '@/app/utils/supabase/server'
import { createAdminClient } from '@/app/utils/supabase/admin'
import { SemesterNode } from '@/app/courses/types/course'

const semesterTreeSelect = `
  id,
  name,
  chapters!inner (
    id,
    title,
    order_index,
    courses!inner (
      id,
      name,
      description,
      order_index,
      is_published
    )
  )
`

function normalizeSemestersTree(semesters: any[]): SemesterNode[] {
  return semesters
    .map((sem: any) => {
      const chapters = (sem.chapters || []).sort(
        (a: any, b: any) => a.order_index - b.order_index,
      )

      const sortedChapters = chapters
        .map((chap: any) => ({
          ...chap,
          courses: (chap.courses || [])
            .filter((course: any) => course.is_published)
            .sort((a: any, b: any) => a.order_index - b.order_index),
        }))
        .filter((chapter: any) => chapter.courses.length > 0)

      return {
        id: sem.id,
        name: sem.name,
        chapters: sortedChapters,
      }
    })
    .filter((semester) => semester.chapters.length > 0) as SemesterNode[]
}

/**
 * 取得使用者有權限存取的學期、章節與單元樹狀結構
 * 隱藏條件由 Supabase RLS 自動處理，這裡主要處理結果排序與過濾未發布內容
 */
export const getAccessibleSemestersTree = cache(async function getAccessibleSemestersTree(): Promise<
  SemesterNode[]
> {
  const supabase = await createClient()

  // Supabase automatically filters out semesters and courses the user doesn't have access to via RLS
  const { data: semesters, error } = await supabase
    .from('semesters')
    .select(semesterTreeSelect)
    .order('created_at', { ascending: false })

  if (error || !semesters) {
    if (error) console.error('Failed to fetch semesters tree:', error)
    return []
  }

  return normalizeSemestersTree(semesters)
})

/**
 * 取得公開可瀏覽的課程樹，用於未登入使用者的 /courses 頁面與 SEO。
 */
export const getPublishedSemestersTree = cache(async function getPublishedSemestersTree(): Promise<
  SemesterNode[]
> {
  const admin = createAdminClient()
  const { data: semesters, error } = await admin
    .from('semesters')
    .select(semesterTreeSelect)
    .order('created_at', { ascending: false })

  if (error || !semesters) {
    if (error) console.error('Failed to fetch published semesters tree:', error)
    return []
  }

  return normalizeSemestersTree(semesters)
})

/**
 * 取得公開可見的課程基本資訊，僅用於權限提示與 metadata 判斷。
 */
export const getPublishedCourseSummary = cache(
  async function getPublishedCourseSummary(slug: string) {
    const admin = createAdminClient()
    const { data: course, error } = await admin
      .from('courses')
      .select('id, name, description, is_published')
      .eq('id', slug)
      .eq('is_published', true)
      .maybeSingle()

    if (error) {
      console.error(`Failed to fetch published course summary for ${slug}:`, error)
      return null
    }

    return course
  },
)

/**
 * 取得單一課程的詳細內容
 * @param slug 課程 ID (Slug)
 */
export const getCourseWithContents = cache(async function getCourseWithContents(slug: string) {
  const supabase = await createClient()

  // 使用 maybeSingle 避免 0 rows 時拋出錯誤 (PGRST116)
  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      id,
      name,
      description,
      chapter_id,
      course_contents (
        id,
        course_id,
        type,
        content,
        program_id,
        order_index,
        created_at,
        programs (
          id,
          name,
          language,
          code_content,
          created_at
        )
      )
    `)
    .eq('id', slug)
    .maybeSingle()

  if (error) {
    console.error(`Failed to fetch course detail for ${slug}:`, error)
    return null
  }

  if (course) {
    // Sort contents by their order index inline
    course.course_contents = (course.course_contents || []).map((content: any) => ({
      ...content,
      // Map programs object to program for consistency with CourseContent type
      program: content.programs
    })).sort(
      (a: any, b: any) => a.order_index - b.order_index
    )
  }

  return course
})
