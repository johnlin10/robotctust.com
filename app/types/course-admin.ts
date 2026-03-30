export interface Semester {
  id: string
  name: string
  is_active: boolean
  created_at: string
}

export interface Chapter {
  id: string
  semester_id: string
  title: string
  order_index: number
  created_at: string
}

export interface Course {
  id: string
  chapter_id: string
  name: string
  description: string | null
  order_index: number
  is_published: boolean
  reward_exp: number
  created_at: string
}

export type CourseContentType =
  | 'markdown'
  | 'text'
  | 'header1'
  | 'header2'
  | 'header3'
  | 'code'
  | 'image'

export interface CourseContent {
  id: string
  course_id: string
  type: CourseContentType
  content: string
  program_id: string | null
  order_index: number
  created_at: string
}

export interface CourseTreeNode extends Course {
  contents: CourseContent[]
}

export interface ChapterTreeNode extends Chapter {
  courses: CourseTreeNode[]
}

export interface SemesterStats {
  chapterCount: number
  courseCount: number
  publishedCourseCount: number
  draftCourseCount: number
}

export interface SemesterTreeNode extends Semester {
  chapters: ChapterTreeNode[]
  stats: SemesterStats
}

export interface CurriculumPayload {
  semesters: Semester[]
  chapters: ChapterTreeNode[]
}

export interface CurriculumOverviewPayload {
  semesters: SemesterTreeNode[]
}

export interface CourseWorkspacePayload {
  semesters: Semester[]
  chapters: Chapter[]
  course: CourseTreeNode & {
    semester_id: string
  }
}

export interface CourseVerificationRow {
  id: string
  user_id: string
  course_id: string
  status: 'pending' | 'approved' | 'rejected'
  verified_by: string | null
  created_at: string
  approved_at: string | null
}
