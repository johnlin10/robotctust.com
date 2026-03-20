/**
 * 課程管理
 * @description 課程管理，包括章節、單元與內容的增刪改查與重新排序
 * @author John Lin
 */

import { createAdminClient } from '@/app/utils/supabase/admin'
import {
  Chapter,
  ChapterTreeNode,
  Course,
  CourseContent,
  CurriculumPayload,
  Semester,
} from '@/app/types/course-admin'

// 資料表
type ReorderTable = 'chapters' | 'courses' | 'course_contents'

// 重新排序項目
interface ReorderItem {
  id: string
  order_index: number
}

// 新增章節輸入
interface CreateChapterInput {
  semester_id: string
  title: string
}

// 新增課程輸入
interface CreateCourseInput {
  chapter_id: string
  id: string
  name: string
  description?: string
}

// 新增課程內容輸入
interface CreateCourseContentInput {
  course_id: string
  type: string
  content: string
  program_id?: string | null
}

/**
 * 獲取下一個排序索引
 * @param table - 資料表
 * @param filterColumn - 過濾欄位
 * @param filterValue - 過濾值
 * @returns 下一個排序索引
 */
async function getNextOrderIndex(
  table: ReorderTable,
  filterColumn: string,
  filterValue: string,
): Promise<number> {
  // 建立管理員客戶端
  const admin = createAdminClient()
  // 獲取下一個排序索引
  const { data, error } = await admin
    .from(table) // 資料表
    .select('order_index') // 選擇排序索引
    .eq(filterColumn, filterValue) // 過濾欄位
    .order('order_index', { ascending: false }) // 根據排序索引排序
    .limit(1) // 限制為一筆
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  // 返回下一個排序索引
  return (data?.order_index || 0) + 1
}

/**
 * 獲取課程章節、單元與內容
 * @param semesterId - 學期 ID
 * @returns 課程章節、單元與內容
 */
export async function getCurriculumTree(
  semesterId?: string | null,
): Promise<CurriculumPayload> {
  // 建立管理員客戶端
  const admin = createAdminClient()
  // 獲取學期
  const { data: semesters, error: semesterError } = await admin
    .from('semesters') // 學期資料表
    .select('id, name, is_active, created_at') // 選擇學期 ID、學期名稱、是否為活動學期、建立時間
    .order('is_active', { ascending: false }) // 根據是否為活動學期排序
    .order('created_at', { ascending: false }) // 根據建立時間排序

  if (semesterError) {
    throw new Error(semesterError.message)
  }

  // 獲取選定的學期 ID
  const selectedSemesterId =
    semesterId ||
    semesters?.find((semester) => semester.is_active)?.id ||
    semesters?.[0]?.id

  if (!selectedSemesterId) {
    // 如果沒有選定的學期 ID，返回空的大綱
    return {
      semesters: [],
      chapters: [],
    }
  }

  // 獲取章節
  const { data: chapterRows, error: chapterError } = await admin
    .from('chapters') // 章節資料表
    .select('id, semester_id, title, order_index, created_at') // 選擇章節 ID、學期 ID、章節標題、排序索引、建立時間
    .eq('semester_id', selectedSemesterId) // 過濾學期 ID
    .order('order_index', { ascending: true }) // 根據排序索引排序

  if (chapterError) {
    throw new Error(chapterError.message)
  }

  // 獲取章節
  const chapters = (chapterRows || []) as Chapter[]
  // 獲取章節 ID
  const chapterIds = chapters.map((chapter) => chapter.id)

  if (chapterIds.length === 0) {
    // 如果沒有章節 ID，返回空的大綱
    return {
      semesters: (semesters || []) as Semester[],
      chapters: [],
    }
  }

  // 獲取課程
  const { data: courseRows, error: courseError } = await admin
    .from('courses') // 課程資料表
    .select(
      'id, chapter_id, name, description, order_index, is_published, reward_exp, created_at',
    ) // 選擇課程 ID、章節 ID、課程名稱、課程描述、排序索引、是否發布、獲得經驗值、建立時間
    .in('chapter_id', chapterIds) // 過濾章節 ID
    .order('order_index', { ascending: true }) // 根據排序索引排序

  if (courseError) {
    throw new Error(courseError.message)
  }

  // 獲取課程
  const courses = (courseRows || []) as Course[]
  // 獲取課程 ID
  const courseIds = courses.map((course) => course.id)

  // 獲取課程內容
  let contents: CourseContent[] = []
  if (courseIds.length > 0) {
    // 如果課程 ID 大於 0，獲取課程內容
    const { data: contentRows, error: contentError } = await admin
      .from('course_contents') // 課程內容資料表
      .select(
        'id, course_id, type, content, program_id, order_index, created_at',
      ) // 選擇課程內容 ID、課程 ID、內容類型、內容、程式碼 ID、排序索引、建立時間
      .in('course_id', courseIds) // 過濾課程 ID
      .order('order_index', { ascending: true }) // 根據排序索引排序

    if (contentError) {
      throw new Error(contentError.message)
    }
    contents = (contentRows || []) as CourseContent[]
  }

  // 組成章節樹
  const chapterTree = chapters.map((chapter) => {
    // 組成章節課程
    const chapterCourses = courses
      .filter((course) => course.chapter_id === chapter.id) // 過濾章節 ID
      .map((course) => ({
        ...course,
        contents: contents.filter((content) => content.course_id === course.id),
      }))

    // 返回章節樹
    return {
      ...chapter,
      courses: chapterCourses,
    }
  }) as ChapterTreeNode[]

  return {
    // 返回學期
    semesters: (semesters || []) as Semester[],
    // 返回章節樹
    chapters: chapterTree,
  }
}

/**
 * 新增章節
 * @param input - 新增章節輸入
 * @returns 新增章節
 */
export async function createChapter(
  input: CreateChapterInput,
): Promise<Chapter> {
  // 建立管理員客戶端
  const admin = createAdminClient()
  // 獲取下一個排序索引
  const order_index = await getNextOrderIndex(
    'chapters',
    'semester_id',
    input.semester_id,
  )
  // 新增章節
  const { data, error } = await admin
    .from('chapters') // 章節資料表
    .insert({
      semester_id: input.semester_id,
      title: input.title,
      order_index,
    }) // 插入學期 ID、章節標題、排序索引
    .select('id, semester_id, title, order_index, created_at') // 選擇章節 ID、學期 ID、章節標題、排序索引、建立時間
    .single() // 限制為一筆

  if (error) throw new Error(error.message)

  // 返回新增的章節
  return data as Chapter
}

/**
 * 新增課程
 * @param input - 新增課程輸入
 * @returns 新增課程
 */
export async function createCourse(input: CreateCourseInput): Promise<Course> {
  // 建立管理員客戶端
  const admin = createAdminClient()
  // 獲取下一個排序索引
  const order_index = await getNextOrderIndex(
    'courses',
    'chapter_id',
    input.chapter_id,
  )
  // 新增課程
  const { data, error } = await admin
    .from('courses') // 課程資料表
    .insert({
      id: input.id,
      chapter_id: input.chapter_id,
      name: input.name,
      description: input.description || null,
      order_index,
    }) // 插入課程 ID、章節 ID、課程名稱、課程描述、排序索引
    .select(
      'id, chapter_id, name, description, order_index, is_published, reward_exp, created_at',
    ) // 選擇課程 ID、章節 ID、課程名稱、課程描述、排序索引、是否發布、獲得經驗值、建立時間
    .single() // 限制為一筆

  if (error) throw new Error(error.message)

  // 返回新增的課程
  return data as Course
}

/**
 * 新增課程內容
 * @param input - 新增課程內容輸入
 * @returns 新增課程內容
 */
export async function createCourseContent(
  input: CreateCourseContentInput,
): Promise<CourseContent> {
  // 建立管理員客戶端
  const admin = createAdminClient()
  // 獲取下一個排序索引
  const order_index = await getNextOrderIndex(
    'course_contents',
    'course_id',
    input.course_id,
  )
  // 新增課程內容
  const { data, error } = await admin
    .from('course_contents') // 課程內容資料表
    .insert({
      course_id: input.course_id,
      type: input.type,
      content: input.content,
      order_index,
      program_id: input.program_id || null,
    }) // 插入課程 ID、內容類型、內容、排序索引、程式碼 ID
    .select('id, course_id, type, content, program_id, order_index, created_at') // 選擇課程內容 ID、課程 ID、內容類型、內容、程式碼 ID、排序索引、建立時間
    .single() // 限制為一筆

  if (error) throw new Error(error.message)

  // 返回新增的課程內容
  return data as CourseContent
}

/**
 * 重新排序課程章節、單元與內容
 * @param table - 重新排序的資料表
 * @param rows - 重新排序的項目
 * @returns 重新排序的結果
 */
export async function reorderItems(
  table: ReorderTable,
  rows: ReorderItem[],
): Promise<void> {
  // 建立管理員客戶端
  const admin = createAdminClient()
  // 重新排序項目
  await Promise.all(
    rows.map(async (row) => {
      // 更新排序索引
      const { error } = await admin
        .from(table) // 資料表
        .update({ order_index: row.order_index }) // 更新排序索引
        .eq('id', row.id) // 過濾 ID

      if (error) throw new Error(error.message)
    }),
  )
}

/**
 * 更新課程發布狀態
 * @param courseId - 課程 ID
 * @param isPublished - 是否發布
 * @returns 更新課程發布狀態的結果
 */
export async function updateCoursePublishState(
  courseId: string,
  isPublished: boolean,
): Promise<void> {
  // 建立管理員客戶端
  const admin = createAdminClient()
  // 更新課程發布狀態
  const { error } = await admin
    .from('courses') // 課程資料表
    .update({ is_published: isPublished }) // 更新課程發布狀態
    .eq('id', courseId) // 過濾課程 ID

  if (error) throw new Error(error.message)
}
