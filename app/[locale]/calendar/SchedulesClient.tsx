'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import styles from './schedules.module.scss'

// components
import SchedulesCalendar from './components/SchedulesCalendar'
import Loading from '@/app/components/Loading/Loading'
// type
import { ScheduleEvent } from '@/app/types/Schedule'
// utils
import { getPublishedScheduleEvents } from '@/app/utils/scheduleService'
import {
  getAvailableAcademicYears,
  getCurrentAcademicYear,
  filterEventsByAcademicYear,
  formatAcademicYear,
} from './utils/academicYear'

import { useTranslations } from 'next-intl'

/**
 * [Component] 行事曆頁面 Client 元件
 */
export default function SchedulesClient() {
  const t = useTranslations('Calendar')
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<number>(getCurrentAcademicYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isDayDetailVisible, setIsDayDetailVisible] = useState(false)

  //* 取得可用的學年度選項
  const availableYears = useMemo(() => {
    const years = getAvailableAcademicYears(events)
    return years.map((year) => ({
      value: year,
      label: formatAcademicYear(year, t),
      eventCount: filterEventsByAcademicYear(events, year).length,
    }))
  }, [events, t])

  //* 過濾當前選中學年度的事件
  const filteredEvents = useMemo(() => {
    return filterEventsByAcademicYear(events, selectedYear)
  }, [events, selectedYear])

  // 載入資料
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getPublishedScheduleEvents()
        setEvents(data)
      } catch (err) {
        console.error('Error loading schedule data:', err)
        setError(err instanceof Error ? err.message : t('error.loadFailed'))
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [t])

  //* 如果沒有可用的學年度，設定為當前學年度
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.find((y) => y.value === selectedYear)) {
      setSelectedYear(availableYears[0].value)
    }
  }, [availableYears, selectedYear])

  //* 取得特定日期的事件
  const getEventsForDate = useCallback((date: string): ScheduleEvent[] => {
    const clickedDate = new Date(date)
    const cy = clickedDate.getFullYear()
    const cm = clickedDate.getMonth()
    const cd = clickedDate.getDate()
    return filteredEvents.filter((ev) => {
      const d = new Date(ev.startDateTime.date)
      return d.getFullYear() === cy && d.getMonth() === cm && d.getDate() === cd
    })
  }, [filteredEvents])

  const handleEventClick = useCallback((_eventId: string) => { /* 未來實作 */ }, [])

  const handleDateClick = useCallback((date: string) => {
    setSelectedDate(date)
    setIsDayDetailVisible(true)
  }, [])

  const handleCloseDayDetail = useCallback(() => {
    setIsDayDetailVisible(false)
    setTimeout(() => setSelectedDate(null), 300)
  }, [])

  return (
    <div className={styles.schedules}>
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
            selectedDateEvents={selectedDate ? getEventsForDate(selectedDate) : []}
            onCloseDayDetail={handleCloseDayDetail}
          />
        </div>
      )}

      {error && (
        <div className={styles.errorState}>
          <h3>{t('error.loadFailed')}</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            {t('error.retry')}
          </button>
        </div>
      )}

      {loading && <Loading text={t('loading')} />}

      {!loading && !error && availableYears.length === 0 && (
        <div className={styles.emptyState}>
          <h3>{t('emptyState.title')}</h3>
          <p>{t('emptyState.description')}</p>
        </div>
      )}
    </div>
  )
}
