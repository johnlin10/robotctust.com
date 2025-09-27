'use client'

import React, { useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { ScheduleEvent } from '../../../types/Schedule'
import { convertEventsToCalendarFormat } from '../../utils/calendarHelpers'
import {
  getAcademicYearConfig,
  isDateInSemester,
} from '../../utils/academicYear'
import { useHeaderState } from '../../../contexts/HeaderContext'
import { Selector } from '../../../components/Selector'
import { SelectorOption } from '../../../components/Selector'
import styles from './SchedulesCalendar.module.scss'
import { useStickyDetection } from '../../../hooks/useStickyDetection'

interface SchedulesCalendarProps {
  events: ScheduleEvent[]
  selectedYear: number
  availableYears: SelectorOption<number>[]
  onYearChange: (year: number) => void
  onEventClick?: (eventId: string) => void
  onDateClick?: (date: string) => void
  selectedDate?: string | null
  isDayDetailVisible?: boolean
  selectedDateEvents?: ScheduleEvent[]
  onCloseDayDetail?: () => void
}

/**
 * 課程行事曆主元件
 * 使用 FullCalendar 顯示年檢視行事曆
 */
const SchedulesCalendar: React.FC<SchedulesCalendarProps> = ({
  events,
  selectedYear,
  availableYears,
  onYearChange,
  onEventClick,
  onDateClick,
  selectedDate,
  isDayDetailVisible,
  selectedDateEvents = [],
  onCloseDayDetail,
}) => {
  const { isCompactHeader } = useHeaderState()
  const stickyState = useStickyDetection({
    topOffset: 60,
    enabled: true,
  })

  //* 月份導航狀態
  const [activeMonth, setActiveMonth] = React.useState<string>('')
  //* 轉換事件為 FullCalendar 格式
  const calendarEvents = useMemo(() => {
    return convertEventsToCalendarFormat(events)
  }, [events])

  //* 取得學年度配置
  const yearConfig = useMemo(() => {
    return getAcademicYearConfig(selectedYear)
  }, [selectedYear])

  //* 計算有效日期範圍（暫時註解，未來可能會用到）
  // const validRange = useMemo(() => {
  //   if (!yearConfig) return undefined

  //   return {
  //     start: yearConfig.firstSemester.start,
  //     end: yearConfig.secondSemester.end,
  //   }
  // }, [yearConfig])

  //* 處理事件點擊
  const handleEventClick = (clickInfo: { event: { id: string } }) => {
    if (onEventClick) {
      onEventClick(clickInfo.event.id)
    }
  }
  //* 處理日期點擊
  const handleDateClick = (clickInfo: { dateStr: string }) => {
    if (onDateClick) {
      onDateClick(clickInfo.dateStr)
    }
  }

  //* 滾動到指定月份
  const scrollToMonth = (year: number, month: number) => {
    const monthId = `month-${year}-${month}`
    const element = document.getElementById(monthId)
    if (element) {
      const elementTop = element.offsetTop
      const offsetPosition = elementTop - 150 // 對齊到頂部 126px 位置

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
      setActiveMonth(monthId)
    }
  }

  //* 統計每個月的事件數量
  const getMonthEventCount = (year: number, month: number): number => {
    return events.filter((event) => {
      const eventDate = new Date(event.startDateTime.date)
      return eventDate.getFullYear() === year && eventDate.getMonth() === month
    }).length
  }

  //* 計算選中日期事件的時間範圍
  const calculateTimeRange = (dateEvents: ScheduleEvent[]) => {
    if (dateEvents.length === 0) {
      return { start: '08:00:00', end: '18:00:00' }
    }

    // 取得所有事件的開始和結束時間
    const times = dateEvents.flatMap((event) => [
      event.startDateTime.time || '08:00:00',
      event.endDateTime?.time || event.startDateTime.time || '18:00:00',
    ])

    // 找出最早和最晚的時間
    times.sort()
    const earliest = times[0]
    const latest = times[times.length - 1]

    // 往前推1小時，往後推1小時
    const startHour = Math.max(0, parseInt(earliest.split(':')[0]) - 1)
    const endHour = Math.min(23, parseInt(latest.split(':')[0]) + 1)

    return {
      start: `${startHour.toString().padStart(2, '0')}:00:00`,
      end: `${endHour.toString().padStart(2, '0')}:59:59`,
    }
  }

  //* 自定義日期樣式 - 學期外日期暗淡（暫時註解，未來可能會用到）
  // const dayClassNames = (date: { date: Date }) => {
  //   const dateObj = date.date
  //   const isInSemester = isDateInSemester(dateObj, selectedYear)

  //   return isInSemester ? '' : styles.dayOutOfSemester
  // }

  //* 滾動到指定日期
  const scrollToDate = (dateStr: string) => {
    const targetDate = new Date(dateStr)
    const year = targetDate.getFullYear()
    const month = targetDate.getMonth()

    // 先滾動到對應月份
    scrollToMonth(year, month)

    // 稍微延遲後高亮該日期
    setTimeout(() => {
      const dateCell = document.querySelector(`[data-date="${dateStr}"]`)
      if (dateCell) {
        dateCell.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }, 300)
  }

  //* 生成學年度的所有月份
  const academicYearMonths = useMemo(() => {
    if (!yearConfig) return []

    const months = []
    const startDate = new Date(yearConfig.firstSemester.start)
    const endDate = new Date(yearConfig.secondSemester.end)

    const current = new Date(startDate)
    current.setDate(1) // 設定為每月1號

    while (current <= endDate) {
      months.push({
        year: current.getFullYear(),
        month: current.getMonth(),
        date: new Date(current),
      })
      current.setMonth(current.getMonth() + 1)
    }

    return months
  }, [yearConfig])

  //* 監聽月份容器進入視窗
  React.useEffect(() => {
    const observers: IntersectionObserver[] = []

    academicYearMonths.forEach((monthInfo) => {
      const monthId = `month-${monthInfo.year}-${monthInfo.month}`
      const element = document.getElementById(monthId)

      if (element) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                setActiveMonth(monthId)
              }
            })
          },
          {
            threshold: [0.3],
            rootMargin: '-100px 0px -50% 0px',
          }
        )

        observer.observe(element)
        observers.push(observer)
      }
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [academicYearMonths])

  if (!yearConfig) {
    return (
      <div className={styles.errorContainer}>
        <p>找不到 {selectedYear} 學年度的配置資料</p>
      </div>
    )
  }

  return (
    <div className={styles.calendarContainer}>
      {/* <div className={styles.yearTitle}>{formatAcademicYear(selectedYear)}</div> */}

      {/* 學年度選擇器 */}
      <div className={styles.yearSelector}>
        <h2>學年度</h2>
        <Selector<number>
          mode="single"
          options={availableYears}
          value={selectedYear}
          onChange={onYearChange}
          showCount={true}
          placeholder="請選擇學年度..."
        />
      </div>

      <div className={styles.calendarContent}>
        {/* 快速導航 */}
        <div
          ref={stickyState.ref}
          className={`${styles.calendarAside} ${
            isCompactHeader ? styles.headerCompact : ''
          } ${stickyState.isSticky ? styles.sticky : ''}`}
        >
          <div className={styles.asideHeader}>
            <h3>快速導航</h3>
            <span className={styles.eventCount}>共 {events.length} 個行程</span>
          </div>
          <div className={styles.monthNavigation}>
            {academicYearMonths.map((monthInfo) => {
              const monthId = `month-${monthInfo.year}-${monthInfo.month}`
              const eventCount = getMonthEventCount(
                monthInfo.year,
                monthInfo.month
              )
              const isActive = activeMonth === monthId

              return (
                <button
                  key={monthId}
                  className={`${styles.monthNavButton} ${
                    isActive ? styles.active : ''
                  } ${eventCount === 0 ? styles.empty : ''}`}
                  onClick={() => scrollToMonth(monthInfo.year, monthInfo.month)}
                >
                  <div className={styles.monthNavContent}>
                    <span className={styles.monthName}>
                      {monthInfo.date.toLocaleDateString('zh-TW', {
                        month: 'short',
                      })}
                    </span>
                    <span className={styles.monthYear}>{monthInfo.year}</span>
                  </div>
                  {eventCount > 0 && (
                    <span className={styles.monthEventCount}>{eventCount}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 月份容器 */}
        <div className={styles.monthsGrid}>
          {academicYearMonths.map((monthInfo) => (
            <div
              key={`${monthInfo.year}-${monthInfo.month}`}
              id={`month-${monthInfo.year}-${monthInfo.month}`}
              className={styles.monthContainer}
            >
              <div className={styles.monthHeader}>
                {monthInfo.date.toLocaleDateString('zh-TW', {
                  year: 'numeric',
                  month: 'long',
                })}
              </div>
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                initialDate={monthInfo.date}
                height="auto"
                locale="zh-tw"
                // 日期範圍限制 - 只顯示當月
                validRange={{
                  start: new Date(monthInfo.year, monthInfo.month, 1),
                  end: new Date(monthInfo.year, monthInfo.month + 2, 0),
                }}
                // 事件配置
                events={calendarEvents}
                eventDisplay="block"
                eventClick={handleEventClick}
                dateClick={handleDateClick}
                // 隱藏標題工具列
                headerToolbar={false}
                // 隱藏其他月份的日期
                fixedWeekCount={false}
                showNonCurrentDates={false}
                // 日期格式
                dayHeaderFormat={{ weekday: 'narrow' }}
                dayCellContent={(arg) => {
                  return arg.date.getDate().toString()
                }}
                // 事件時間格式
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  meridiem: false,
                  hour12: false,
                }}
                // 響應式配置
                windowResizeDelay={10}
                // 月份配置
                dayCellClassNames={(date) => {
                  const isInSemester = isDateInSemester(date.date, selectedYear)
                  const dateStr = date.date.toISOString().split('T')[0]
                  const isSelected = selectedDate === dateStr

                  const classes = []

                  if (isInSemester) {
                    classes.push(styles.dayInSemester)
                  } else {
                    classes.push(styles.dayOutOfSemester)
                  }

                  // 選中日期的樣式
                  if (isSelected) {
                    classes.push(styles.daySelected)
                  }

                  return classes.join(' ')
                }}
                // 自定義屬性 標識日期
                dayCellDidMount={(info) => {
                  const dateStr = info.date.toISOString().split('T')[0]
                  info.el.setAttribute('data-date', dateStr)
                }}
              />
            </div>
          ))}

          {/* 日程詳細檢視器 */}
          <div
            className={`${styles.calendarDayDetailContent} ${
              isDayDetailVisible ? styles.visible : ''
            }`}
          >
            {selectedDate && (
              <>
                <div className={styles.dayDetailHeader}>
                  <h3
                    className={styles.dayDetailTitle}
                    onClick={() => scrollToDate(selectedDate)}
                    title="點擊返回該日期"
                  >
                    {new Date(selectedDate).toLocaleDateString('zh-TW', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long',
                    })}
                  </h3>
                  <button
                    className={styles.closeDayDetailButton}
                    onClick={onCloseDayDetail}
                    aria-label="關閉日程檢視"
                  >
                    ✕
                  </button>
                </div>

                <div className={styles.dayDetailContent}>
                  {selectedDateEvents.length === 0 ? (
                    <div className={styles.noDayEvents}>
                      <p>這天沒有安排任何行程</p>
                    </div>
                  ) : (
                    <FullCalendar
                      key={`day-detail-${selectedDate}`}
                      plugins={[timeGridPlugin, interactionPlugin]}
                      initialView="timeGridDay"
                      initialDate={selectedDate}
                      height="300px"
                      locale="zh-tw"
                      events={convertEventsToCalendarFormat(selectedDateEvents)}
                      slotMinTime={calculateTimeRange(selectedDateEvents).start}
                      slotMaxTime={calculateTimeRange(selectedDateEvents).end}
                      slotDuration="01:00:00"
                      slotLabelInterval="01:00"
                      allDaySlot={false}
                      nowIndicator={true}
                      scrollTime={calculateTimeRange(selectedDateEvents).start}
                      eventClick={handleEventClick}
                      headerToolbar={false}
                      dayHeaders={false}
                      slotLabelFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      }}
                      eventTimeFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      }}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SchedulesCalendar
