// Supabase (PostgreSQL) 關聯式資料庫結構最佳實踐
// 採用正規化 (Normalization) 設計，將原本巢狀的結構拆分成獨立的資料表，並透過 Foreign Key 關聯

export type ContentType = 'header-1' | 'header-2' | 'header-3' | 'markdown' | 'programming'

/**
 * Table: semesters (學期)
 * 儲存學期資訊
 */
export interface SemesterRow {
  id: string          // UUID (Primary Key)
  name: string        // 學期名稱，例如 '114-1'
  created_at: string  // Timestamptz
}

/**
 * Table: chapters (章節)
 * 儲存章節資訊，關聯至特定學期
 */
export interface ChapterRow {
  id: string          // UUID (Primary Key)
  semester_id: string // UUID (Foreign Key -> semesters.id)
  title: string       // 章節標題或編號
  created_at: string  // Timestamptz
}

/**
 * Table: courses (課程)
 * 儲存單堂課程的基本資訊，關聯至特定章節
 */
export interface CourseRow {
  id: string          // UUID 或自訂 Slug (Primary Key)，例如 'diy-tracking-robot'
  chapter_id: string  // UUID (Foreign Key -> chapters.id)
  name: string        // 課程名稱
  description: string // 課程描述
  created_at: string  // Timestamptz
}

/**
 * Table: course_contents (課程內容區塊)
 * 儲存課程內的各個內容區塊，關聯至特定課程
 */
export interface CourseContentRow {
  id: string          // UUID (Primary Key)
  course_id: string   // UUID 或 Slug (Foreign Key -> courses.id)
  type: ContentType   // 內容類型
  content: string     // 說明內容 (Text)
  program: string | null // 程式碼內容 (Text, Nullable)
  order_index: number // 整數，用來確保內容區塊在前端顯示時的排序 (重要)
  created_at: string  // Timestamptz
}

// ============================================================================
// 前端讀取時的關聯資料型別 (透過 Supabase Join 取得的資料結構)
// ============================================================================

export interface CourseWithContents extends CourseRow {
  contents: CourseContentRow[] // 依 order_index 排序
}

export interface ChapterWithCourses extends ChapterRow {
  courses: CourseWithContents[]
}

export interface SemesterWithChapters extends SemesterRow {
  chapters: ChapterWithCourses[]
}
