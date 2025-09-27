/**
 * 課程行事曆相關類型定義
 */

export interface ScheduleEvent {
  id: string
  title: string
  description?: string
  type: 'class' | 'competition' | 'activity' | 'event' | 'school-event' // 上課、競賽、活動、事件、校務行事曆
  startDateTime: {
    date: string // YYYY-MM-DD 格式
    time: string // HH:MM 格式
  }
  endDateTime: {
    date: string
    time: string
  }
  location?: string
  instructor?: string
  color?: string // 事件顏色，會覆蓋預設顏色
  priority: number // 顯示優先級，數字越小優先級越高
  published: boolean
  createdAt: {
    date: string
    time: string
  }
  updatedAt: {
    date: string
    time: string
  }
}

export interface AcademicYear {
  year: number // 114 代表 114 學年度
  firstSemester: {
    start: string // 2025-08-01
    end: string // 2026-01-31
  }
  secondSemester: {
    start: string // 2026-02-01
    end: string // 2026-07-31
  }
}

/**
 * FullCalendar 事件格式
 */
export interface CalendarEvent {
  id: string
  title: string
  start: string // ISO 格式日期時間
  end: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  extendedProps?: {
    type: ScheduleEvent['type']
    description?: string
    location?: string
    instructor?: string
    priority: number
  }
}

/**
 * 學年度選擇器選項
 */
export interface YearOption {
  value: number
  label: string
  eventCount: number
}
