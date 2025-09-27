import { AcademicYear, ScheduleEvent } from '../../types/Schedule'

/**
 * 學年度配置
 * 每學年以上學期年份作為學年年份
 * 例如：114年10月是114年度第一學期，115年3月為114年度第二學期
 */
export const ACADEMIC_YEARS: AcademicYear[] = [
  {
    year: 114,
    firstSemester: {
      start: '2025-08-01',
      end: '2026-01-31',
    },
    secondSemester: {
      start: '2026-02-01',
      end: '2026-07-31',
    },
  },
  {
    year: 115,
    firstSemester: {
      start: '2026-08-01',
      end: '2027-01-31',
    },
    secondSemester: {
      start: '2027-02-01',
      end: '2027-07-31',
    },
  },
  {
    year: 116,
    firstSemester: {
      start: '2027-08-01',
      end: '2028-01-31',
    },
    secondSemester: {
      start: '2028-02-01',
      end: '2028-07-31',
    },
  },
]

/**
 * 根據日期取得學年度
 */
export const getAcademicYear = (date: Date | string): number => {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const year = targetDate.getFullYear()
  const month = targetDate.getMonth() + 1 // 0-based to 1-based

  // 8月開始為新學年
  // 例如：2025年8月 = 114學年度，2026年1月 = 114學年度
  if (month >= 8) {
    return year - 1911 // 轉換為民國年
  } else {
    return year - 1912 // 轉換為民國年，前一學年
  }
}

/**
 * 取得目前學期類型
 */
export const getCurrentSemester = (date: Date | string): 'first' | 'second' => {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const month = targetDate.getMonth() + 1

  // 8月-1月為上學期，2月-7月為下學期
  return month >= 8 || month <= 1 ? 'first' : 'second'
}

/**
 * 取得指定學年度的完整日期範圍
 */
export const getAcademicYearRange = (
  academicYear: number
): { start: Date; end: Date } => {
  const yearConfig = ACADEMIC_YEARS.find((y) => y.year === academicYear)

  if (!yearConfig) {
    throw new Error(`Academic year ${academicYear} not found`)
  }

  return {
    start: new Date(yearConfig.firstSemester.start),
    end: new Date(yearConfig.secondSemester.end),
  }
}

/**
 * 取得指定學年度配置
 */
export const getAcademicYearConfig = (
  academicYear: number
): AcademicYear | null => {
  return ACADEMIC_YEARS.find((y) => y.year === academicYear) || null
}

/**
 * 檢查日期是否在學期範圍內
 */
export const isDateInSemester = (
  date: Date | string,
  academicYear: number
): boolean => {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const yearConfig = getAcademicYearConfig(academicYear)

  if (!yearConfig) return false

  const firstSemesterStart = new Date(yearConfig.firstSemester.start)
  const firstSemesterEnd = new Date(yearConfig.firstSemester.end)
  const secondSemesterStart = new Date(yearConfig.secondSemester.start)
  const secondSemesterEnd = new Date(yearConfig.secondSemester.end)

  return (
    (targetDate >= firstSemesterStart && targetDate <= firstSemesterEnd) ||
    (targetDate >= secondSemesterStart && targetDate <= secondSemesterEnd)
  )
}

/**
 * 取得目前學年度
 */
export const getCurrentAcademicYear = (): number => {
  return getAcademicYear(new Date())
}

/**
 * 從事件列表中提取所有存在的學年度
 */
export const getAvailableAcademicYears = (
  events: ScheduleEvent[]
): number[] => {
  const years = new Set<number>()

  events.forEach((event) => {
    if (event.published) {
      const year = getAcademicYear(event.startDateTime.date)
      years.add(year)
    }
  })

  return Array.from(years).sort((a, b) => b - a) // 降序排列，最新的在前
}

/**
 * 過濾指定學年度的事件
 */
export const filterEventsByAcademicYear = (
  events: ScheduleEvent[],
  academicYear: number
): ScheduleEvent[] => {
  return events.filter((event) => {
    if (!event.published) return false
    return getAcademicYear(event.startDateTime.date) === academicYear
  })
}

/**
 * 轉換學年度為顯示文字
 */
export const formatAcademicYear = (academicYear: number): string => {
  return `${academicYear} 學年度`
}
