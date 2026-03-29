'use client'

import {
  ChapterTreeNode,
  CourseContentType,
  CourseTreeNode,
  CurriculumOverviewPayload,
  CourseWorkspacePayload,
  SemesterTreeNode,
} from '@/app/types/course-admin'

interface ApiErrorResponse {
  error: string
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof value.error === 'string'
  )
}

export interface FlattenedCourseItem {
  semester: SemesterTreeNode
  chapter: ChapterTreeNode
  course: CourseTreeNode
}

export const COURSE_CONTENT_TYPE_OPTIONS: Array<{
  value: CourseContentType
  label: string
}> = [
  { value: 'markdown', label: 'Markdown 多行文字' },
  { value: 'text', label: '一般純文字' },
  { value: 'header1', label: '大標題 H1' },
  { value: 'header2', label: '中標題 H2' },
  { value: 'header3', label: '小標題 H3' },
  { value: 'code', label: '程式碼區塊' },
]

export async function requestJson<T = Record<string, unknown>>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, init)
  const data = (await response.json()) as unknown

  if (!response.ok || isApiErrorResponse(data)) {
    throw new Error(isApiErrorResponse(data) ? data.error : '請求失敗')
  }

  return data as T
}

export async function fetchCurriculumOverview(): Promise<CurriculumOverviewPayload> {
  return requestJson<CurriculumOverviewPayload>(
    '/api/dashboard/curriculum?view=overview',
  )
}

export async function fetchCourseWorkspace(
  courseId: string,
): Promise<CourseWorkspacePayload> {
  return requestJson<CourseWorkspacePayload>(
    `/api/dashboard/curriculum?view=course-workspace&courseId=${courseId}`,
  )
}

export function flattenCourses(
  semesters: SemesterTreeNode[],
): FlattenedCourseItem[] {
  return semesters.flatMap((semester) =>
    semester.chapters.flatMap((chapter) =>
      chapter.courses.map((course) => ({
        semester,
        chapter,
        course,
      })),
    ),
  )
}

export function buildReorderRows(ids: string[]) {
  return ids.map((id, index) => ({
    id,
    order_index: index + 1,
  }))
}

export function withRecalculatedStats(semester: SemesterTreeNode): SemesterTreeNode {
  const courses = semester.chapters.flatMap((ch) => ch.courses)
  return {
    ...semester,
    stats: {
      chapterCount: semester.chapters.length,
      courseCount: courses.length,
      publishedCourseCount: courses.filter((c) => c.is_published).length,
      draftCourseCount: courses.filter((c) => !c.is_published).length,
    },
  }
}

export function formatDashboardDate(dateString: string) {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString))
}

export function getCourseContentTypeLabel(type: CourseContentType) {
  return (
    COURSE_CONTENT_TYPE_OPTIONS.find((option) => option.value === type)?.label ||
    '內容區塊'
  )
}
