/**
 * 競賽相關的 TypeScript 型別定義
 * 適用於 Firestore 資料庫儲存和前端應用
 */

//* 競賽舉辦層級
export type CompetitionPosition =
  | 'club' // 社團
  | 'school-inside' // 校內
  | 'school-outside' // 校外
  | 'local' //  區域級
  | 'national' // 國家級
  | 'international' // 國際級

//* 競賽狀態
export type CompetitionStatus =
  | 'draft' // 草稿
  | 'upcoming' // 未來
  | 'registration-open' // 報名中
  | 'ongoing' // 進行中
  | 'completed' // 已完成
  | 'cancelled' // 已取消

//* 時間線階段類型
export type TimelineStepType =
  | 'registration' // 報名階段
  | 'pre' // 初賽
  | 'semi' // 半決賽
  | 'final' // 決賽
  | 'result' // 結果公佈
  | 'custom'

//* 日期時間結構（統一格式）
export interface CompetitionDateTime {
  /** ISO 8601 日期字串 (YYYY-MM-DD) 或空值 */
  date: string | null
  /** 24小時制時間字串 (HH:mm) 或空值 */
  time: string | null
  /** Firestore Timestamp (用於資料庫儲存) */
  timestamp?: unknown // FirebaseFirestore.Timestamp
}

//* 時間線階段
export interface TimelineStep {
  /** 階段唯一識別碼
   * id + step 組成
   * @example 'line-following-2025-11-12-registration-phase'
   */
  id: string //
  /** 階段類型 */
  step: TimelineStepType
  /** 階段顯示名稱 */
  stepName: string
  /** 開始時間 */
  startDateTime: CompetitionDateTime
  /** 結束時間 */
  endDateTime: CompetitionDateTime
  /** 階段時間 */
  timeline?: {
    stepName: string
    startTime: string
    endTime: string | null
  }[]
  /** 階段描述 */
  description?: string
  /** 是否為必要階段 */
  required?: boolean
  /** 排序權重 */
  order: number
}

//* 競賽基本資訊
export interface Competition {
  /** 競賽唯一識別碼 */
  id: string
  /** 競賽標題 */
  title: string
  /** 競賽簡短描述 */
  description: string
  /** 競賽詳細說明 (Markdown 格式) */
  detailMarkdown: string
  /** 競賽舉辦層級 */
  position: CompetitionPosition
  /** 競賽狀態 */
  status: CompetitionStatus
  /** 時間線 */
  timeline: TimelineStep[]
  /** 相關連結 */
  link: string | null
  /** 競賽圖片 URL */
  image: string | null
  /** 標籤 */
  tags: string[]
  /** 優先級 (數字越小優先級越高) */
  priority: number
  /** 建立時間 */
  createdAt: CompetitionDateTime
  /** 最後更新時間 */
  updatedAt: CompetitionDateTime
  /** 建立者 ID */
  createdBy?: string
  /** 最後更新者 ID */
  updatedBy?: string
  /** 是否已發布 */
  published: boolean
  /** 預估參與人數 */
  estimatedParticipants?: number
  /** 報名費用 */
  registrationFee?: number
  /** 獎金或獎品資訊 */
  rewards?: string[]
  /** 聯絡資訊 */
  contact?: {
    email?: string
    phone?: string
    person?: string
  }
}

//* 用於建立新競賽的輸入型別
export interface CreateCompetitionInput {
  title: string
  description: string
  detailMarkdown?: string
  position: CompetitionPosition
  timeline: Omit<TimelineStep, 'id'>[]
  link?: string | null
  image?: string | null
  tags?: string[]
  priority?: number
  estimatedParticipants?: number
  registrationFee?: number
  rewards?: string[]
  contact?: Competition['contact']
}

//* 用於更新競賽的輸入型別
export interface UpdateCompetitionInput
  extends Partial<CreateCompetitionInput> {
  id: string
  status?: CompetitionStatus
  published?: boolean
}

//* 競賽查詢過濾器
export interface CompetitionFilter {
  position?: CompetitionPosition[]
  status?: CompetitionStatus[]
  tags?: string[]
  dateRange?: {
    start: string // ISO date string
    end: string // ISO date string
  }
  published?: boolean
}

//* 競賽排序選項
export interface CompetitionSort {
  field: 'createdAt' | 'updatedAt' | 'priority' | 'title'
  direction: 'asc' | 'desc'
}

//* Firestore 文件結構（用於資料庫操作）
export interface CompetitionDocument
  extends Omit<Competition, 'createdAt' | 'updatedAt' | 'timeline'> {
  timeline: (Omit<TimelineStep, 'startDateTime' | 'endDateTime'> & {
    startDateTime: {
      date: string | null
      time: string | null
      timestamp?: unknown // FirebaseFirestore.Timestamp
    }
    endDateTime: {
      date: string | null
      time: string | null
      timestamp?: unknown // FirebaseFirestore.Timestamp
    }
  })[]
  createdAt: unknown // FirebaseFirestore.Timestamp
  updatedAt: unknown // FirebaseFirestore.Timestamp
}
