import { cache } from 'react'
import { createClient } from '@/app/utils/supabase/server'
import { SemesterNode } from '@/app/courses/types/course'

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
    .select(`
      id,
      name,
      chapters!inner (
        id,
        title,
        order_index,
        courses!inner (
          id,
          name,
          order_index,
          is_published
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error || !semesters) {
    if (error) console.error('Failed to fetch semesters tree:', error)
    return []
  }

  // Format and sort tree
  return semesters.map((sem: any) => {
    // Sort chapters
    const chapters = (sem.chapters || []).sort((a: any, b: any) => a.order_index - b.order_index)
    
    // Sort courses inside chapters
    const sortedChapters = chapters.map((chap: any) => ({
      ...chap,
      // Only show published courses on general view
      courses: (chap.courses || [])
        .filter((c: any) => c.is_published)
        .sort((a: any, b: any) => a.order_index - b.order_index)
    }))

    return {
      id: sem.id,
      name: sem.name,
      chapters: sortedChapters
    }
  }) as SemesterNode[]
})

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
        type,
        content,
        program_id,
        order_index
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
    course.course_contents = (course.course_contents || []).sort(
      (a: any, b: any) => a.order_index - b.order_index
    )
  }

  return course
})
