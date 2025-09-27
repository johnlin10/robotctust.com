import { ScheduleEvent, CalendarEvent } from '../../types/Schedule'
import { Competition } from '../../types/competition'

/**
 * 事件類型顏色配置
 */
export const EVENT_COLORS = {
  class: {
    backgroundColor: 'var(--theme-blue-400)',
    borderColor: 'var(--theme-blue-400)',
    textColor: '#FFFFFF',
  },
  competition: {
    backgroundColor: 'var(--theme-purple-400)',
    borderColor: 'var(--theme-purple-400)',
    textColor: '#FFFFFF',
  },
  activity: {
    backgroundColor: 'var(--theme-green-400)',
    borderColor: 'var(--theme-green-400)',
    textColor: '#FFFFFF',
  },
  event: {
    backgroundColor: 'var(--theme-red-400)',
    borderColor: 'var(--theme-red-400)',
    textColor: '#FFFFFF',
  },
  'school-event': {
    backgroundColor: 'var(--theme-gray-400)',
    borderColor: 'var(--theme-gray-400)',
    textColor: '#FFFFFF',
  },
}

/**
 * 將課程事件轉換為 FullCalendar 格式
 */
export const convertScheduleEventToCalendarEvent = (
  event: ScheduleEvent
): CalendarEvent => {
  const colors = EVENT_COLORS[event.type]

  return {
    id: event.id,
    title: event.title,
    start: `${event.startDateTime.date}T${event.startDateTime.time}:00`,
    end: `${event.endDateTime.date}T${event.endDateTime.time}:00`,
    backgroundColor: event.color || colors.backgroundColor,
    borderColor: event.color || colors.borderColor,
    textColor: colors.textColor,
    extendedProps: {
      type: event.type,
      description: event.description,
      location: event.location,
      instructor: event.instructor,
      priority: event.priority,
    },
  }
}

/**
 * 將競賽資料轉換為課程事件格式
 */
export const convertCompetitionToScheduleEvent = (
  competition: Competition
): ScheduleEvent[] => {
  if (!competition.published) return []

  return competition.timeline
    .filter(
      (timeline) => timeline.startDateTime.date && timeline.endDateTime.date
    )
    .map((timeline) => ({
      id: `competition-${timeline.id}`,
      title: `${competition.title} - ${timeline.stepName}`,
      description: timeline.description || competition.description,
      type: 'competition' as const,
      startDateTime: {
        date: timeline.startDateTime.date!,
        time: timeline.startDateTime.time || '00:00',
      },
      endDateTime: {
        date: timeline.endDateTime.date!,
        time: timeline.endDateTime.time || '23:59',
      },
      location: '', // 競賽通常沒有固定地點
      instructor: '', // 競賽沒有講師
      priority: competition.priority,
      published: competition.published,
      createdAt: {
        date:
          competition.createdAt.date || new Date().toISOString().split('T')[0],
        time: competition.createdAt.time || '00:00',
      },
      updatedAt: {
        date:
          competition.updatedAt.date || new Date().toISOString().split('T')[0],
        time: competition.updatedAt.time || '00:00',
      },
    }))
}

/**
 * 合併課程事件與競賽事件
 */
export const mergeClassAndCompetitionEvents = (
  classEvents: ScheduleEvent[],
  competitions: Competition[]
): ScheduleEvent[] => {
  const competitionEvents = competitions.flatMap(
    convertCompetitionToScheduleEvent
  )

  return [...classEvents, ...competitionEvents]
    .filter((event) => event.published)
    .sort((a, b) => {
      // 先按日期排序
      const dateA = new Date(`${a.startDateTime.date}T${a.startDateTime.time}`)
      const dateB = new Date(`${b.startDateTime.date}T${b.startDateTime.time}`)

      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime()
      }

      // 日期相同時按優先級排序
      return a.priority - b.priority
    })
}

/**
 * 將事件列表轉換為 FullCalendar 格式
 */
export const convertEventsToCalendarFormat = (
  events: ScheduleEvent[]
): CalendarEvent[] => {
  return events.map(convertScheduleEventToCalendarEvent)
}

/**
 * 取得事件統計資訊
 */
export const getEventStatistics = (events: ScheduleEvent[]) => {
  const stats = {
    total: events.length,
    class: 0,
    competition: 0,
    activity: 0,
    published: 0,
    unpublished: 0,
  }

  events.forEach((event) => {
    stats[event.type as keyof typeof stats]++
    if (event.published) {
      stats.published++
    } else {
      stats.unpublished++
    }
  })

  return stats
}

/**
 * 檢查日期是否為今天
 */
export const isToday = (date: string): boolean => {
  const today = new Date()
  const targetDate = new Date(date)

  return (
    today.getFullYear() === targetDate.getFullYear() &&
    today.getMonth() === targetDate.getMonth() &&
    today.getDate() === targetDate.getDate()
  )
}

/**
 * 檢查事件是否即將到來（7天內）
 */
export const isUpcoming = (event: ScheduleEvent): boolean => {
  const now = new Date()
  const eventDate = new Date(
    `${event.startDateTime.date}T${event.startDateTime.time}`
  )
  const diffTime = eventDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays >= 0 && diffDays <= 7
}

/**
 * 格式化日期時間為可讀格式
 */
export const formatDateTime = (date: string, time: string): string => {
  const dateObj = new Date(`${date}T${time}:00`)

  return dateObj.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
  })
}
