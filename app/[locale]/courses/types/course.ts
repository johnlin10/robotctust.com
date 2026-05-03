export interface CourseNode {
  id: string
  name: string
  description: string | null
  order_index: number
  is_published: boolean
}

export interface ChapterNode {
  id: string
  title: string
  order_index: number
  courses: CourseNode[]
}

export interface SemesterNode {
  id: string
  name: string
  chapters: ChapterNode[]
}
