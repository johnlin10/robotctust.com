'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import styles from './schedules.module.scss'

// components
import SchedulesCalendar from './components/SchedulesCalendar'
import Loading from '../components/Loading/Loading'
// type
import { ScheduleEvent } from '../types/Schedule'
import { Competition } from '../types/competition'
// utils
import { getPublishedClassEvents } from '../utils/classScheduleService'
import { getAllCompetitions } from '../utils/competitionService'
import { mergeClassAndCompetitionEvents } from './utils/calendarHelpers'
import {
  getAvailableAcademicYears,
  getCurrentAcademicYear,
  filterEventsByAcademicYear,
  formatAcademicYear,
} from './utils/academicYear'

/**
 * [Component] 行事曆頁面 Client 元件
 */
export default function SchedulesClient() {
  const [classEvents, setClassEvents] = useState<ScheduleEvent[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<number>(
    getCurrentAcademicYear()
  )
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isDayDetailVisible, setIsDayDetailVisible] = useState(false)

  //* 合併所有事件
  const allEvents = useMemo(() => {
    return mergeClassAndCompetitionEvents(classEvents, competitions)
  }, [classEvents, competitions])

  //* 取得可用的學年度選項
  const availableYears = useMemo(() => {
    const years = getAvailableAcademicYears(allEvents)
    return years.map((year) => ({
      value: year,
      label: formatAcademicYear(year),
      eventCount: filterEventsByAcademicYear(allEvents, year).length,
    }))
  }, [allEvents])

  //* 過濾當前選中學年度的事件
  const filteredEvents = useMemo(() => {
    return filterEventsByAcademicYear(allEvents, selectedYear)
  }, [allEvents, selectedYear])

  // 載入資料
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // 並行載入課程資料和競賽資料
        const [classEventsData, competitionsData] = await Promise.all([
          getPublishedClassEvents(),
          getAllCompetitions(),
        ])

        // 過濾已發布的競賽
        const publishedCompetitions = competitionsData.filter(
          (comp) => comp.published
        )

        setClassEvents(classEventsData)
        setCompetitions(publishedCompetitions)
      } catch (err) {
        console.error('Error loading class schedule data:', err)
        setError(err instanceof Error ? err.message : '載入課程資料失敗')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  //* 取得特定日期的事件
  // 使用 useCallback 避免元件重新渲染時重建函式
  // 將目標日期的解析移出 filter 迴圈，避免每次迭代都重新 createdAt Date 物件，提升效能
  const getEventsForDate = useCallback((date: string): ScheduleEvent[] => {
    const clickedDate = new Date(date)
    const clickedYear = clickedDate.getFullYear()
    const clickedMonth = clickedDate.getMonth()
    const clickedDateNum = clickedDate.getDate()

    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.startDateTime.date)
      return (
        eventDate.getFullYear() === clickedYear &&
        eventDate.getMonth() === clickedMonth &&
        eventDate.getDate() === clickedDateNum
      )
    })
  }, [filteredEvents])

  //* 處理事件點擊
  // 點擊事件卡片時的處理邏輯，使用 useCallback 確保函式參考穩定
  const handleEventClick = useCallback((eventId: string) => {
    console.log('Event clicked:', eventId)
  }, [])

  //* 處理日期點擊
  // 記錄選中的日期，並開啟日程詳細檢視面板
  const handleDateClick = useCallback((date: string) => {
    console.log('Date clicked:', date)
    setSelectedDate(date)
    setIsDayDetailVisible(true)
  }, [])

  //* 關閉日程詳細檢視
  // 隱藏詳細檢視面板，並延遲 300ms 清除選中日期以等待關閉動畫完成
  const handleCloseDayDetail = useCallback(() => {
    setIsDayDetailVisible(false)
    setTimeout(() => setSelectedDate(null), 300)
  }, [])

  // 如果沒有可用的學年度，設定為當前學年度
  useEffect(() => {
    if (
      availableYears.length > 0 &&
      !availableYears.find((y) => y.value === selectedYear)
    ) {
      setSelectedYear(availableYears[0].value)
    }
  }, [availableYears, selectedYear])

  return (
    <div className={styles.schedules}>
      {/* 行事曆內容 */}
      {!loading && !error && (
        <div className={styles.calendarSection}>
          <SchedulesCalendar
            events={filteredEvents}
            selectedYear={selectedYear}
            availableYears={availableYears}
            onYearChange={setSelectedYear}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            selectedDate={selectedDate}
            isDayDetailVisible={isDayDetailVisible}
            selectedDateEvents={
              selectedDate ? getEventsForDate(selectedDate) : []
            }
            onCloseDayDetail={handleCloseDayDetail}
          />
        </div>
      )}

      {/* 錯誤狀態 */}
      {error && (
        <div className={styles.errorState}>
          <h3>載入失敗</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            重新載入
          </button>
        </div>
      )}

      {/* 載入狀態 */}
      {loading && <Loading text="正在載入行事曆" />}

      {/* 無資料狀態 */}
      {!loading && !error && availableYears.length === 0 && (
        <div className={styles.emptyState}>
          <h3>暫無行事曆</h3>
          <p>目前沒有任何已發布的行事曆資料</p>
        </div>
      )}
    </div>
  )
}
