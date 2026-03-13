'use client'

import { useState, useMemo } from 'react'
import styles from './CompetitionTimeline.module.scss'

// utils
import {
  getCompetitionKeyDate,
  sortCompetitionsByTimeline,
} from '../../utils/competitionService'

// hook
import useStickyDetection from '../../hooks/useStickyDetection'

// components
import CompetitionCard from '../CompetitionCard'

// context
import { useHeaderState } from '../../contexts/HeaderContext'

// type
import { Competition } from '../../types/competition'

interface CompetitionTimelineProps {
  competitions: Competition[]
  defaultSortBy?: 'competition' | 'registration'
}

interface TimelineGroup {
  date: string
  displayDate: string
  competitions: Competition[]
}

interface DateSectionProps {
  group: TimelineGroup
  groupIndex: number
  totalGroups: number
  sortBy: 'competition' | 'registration'
}

/**
 * [Function] 格式化日期顯示
 * @param {Date} date - 日期
 * @returns {string} 格式化後的日期
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

/**
 * [Function] 取得日期的簡短格式（用於分組）
 * @param {Date} date - 日期
 * @returns {string} 格式化後的日期
 */
function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0] // YYYY-MM-DD
}

/**
 * 日期區塊元件 (單獨處理 sticky 檢測)
 * @param {TimelineGroup} group - 日期分組
 * @param {number} groupIndex - 日期分組索引
 * @param {number} totalGroups - 日期分組總數
 * @param {DateSectionProps['sortBy']} sortBy - 排序方式
 * @returns {JSX.Element}
 */
function DateSection({
  group,
  groupIndex,
  totalGroups,
  sortBy,
}: DateSectionProps) {
  // 使用 sticky 檢測 hook，top 偏移量為 60px
  const stickyState = useStickyDetection({
    topOffset: 60,
    enabled: true,
  })
  // 取得 Header 狀態
  const { isCompactHeader } = useHeaderState()

  return (
    <div
      ref={stickyState.ref}
      className={`${styles.dateSection} ${
        stickyState.isSticky ? styles.sticky : ''
      } ${isCompactHeader ? styles.compact : ''}`}
    >
      <div className={styles.dateNode}>
        <div className={styles.dateCircle} />
        {groupIndex < totalGroups - 1 && (
          <div className={styles.timelineLine} />
        )}
      </div>
      <div className={styles.dateInfo}>
        <h3 className={styles.dateTitle}>{group.displayDate}</h3>
        <p className={styles.dateSubtitle}>
          {group.competitions.length} 個
          {sortBy === 'competition' ? '競賽' : '報名截止'}
        </p>
      </div>
    </div>
  )
}

/**
 * 將競賽按日期分組
 * @param {Competition[]} competitions - 競賽列表
 * @param {'competition' | 'registration'} sortBy - 排序方式
 * @returns {TimelineGroup[]} 日期分組列表
 */
function groupCompetitionsByDate(
  competitions: Competition[],
  sortBy: 'competition' | 'registration',
): TimelineGroup[] {
  const groups = new Map<string, Competition[]>()

  // 按日期分組
  competitions.forEach((competition) => {
    const keyDate = getCompetitionKeyDate(competition, sortBy)
    if (keyDate) {
      const dateKey = getDateKey(keyDate)
      if (!groups.has(dateKey)) {
        groups.set(dateKey, [])
      }
      groups.get(dateKey)!.push(competition)
    }
  })

  // 轉換為陣列並排序
  const timelineGroups: TimelineGroup[] = Array.from(groups.entries())
    .map(([dateKey, comps]) => {
      const date = new Date(dateKey)
      return {
        date: dateKey,
        displayDate: formatDate(date),
        competitions: comps.sort((a, b) => {
          const dateA = getCompetitionKeyDate(a, sortBy)
          const dateB = getCompetitionKeyDate(b, sortBy)
          if (!dateA || !dateB) return 0
          return dateA.getTime() - dateB.getTime()
        }),
      }
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return timelineGroups
}

/**
 * 競賽時間線元件
 * @param {CompetitionTimelineProps} competitions - 競賽列表
 * @param {CompetitionTimelineProps['defaultSortBy']} defaultSortBy - 預設排序方式
 * @returns {JSX.Element} 競賽時間線
 */
export default function CompetitionTimeline({
  competitions,
  defaultSortBy = 'competition',
}: CompetitionTimelineProps) {
  // 排序方式
  const [sortBy, setSortBy] = useState<'competition' | 'registration'>(
    defaultSortBy,
  )

  /**
   * [Function] 處理排序和分組
   * @returns {TimelineGroup[]} 日期分組列表
   */
  const timelineGroups = useMemo(() => {
    const sortedCompetitions = sortCompetitionsByTimeline(competitions, sortBy)
    return groupCompetitionsByDate(sortedCompetitions, sortBy)
  }, [competitions, sortBy])

  // 沒有競賽資料
  if (competitions.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3>目前沒有競賽資料</h3>
        <p>請稍後再來查看最新的競賽資訊。</p>
      </div>
    )
  }

  return (
    <div className={styles.timelineContainer}>
      {/* 排序控制 */}
      <div className={styles.sortControls}>
        <h2 className={styles.timelineTitle}>時間線</h2>
        <div className={styles.sortButtons}>
          <button
            onClick={() => setSortBy('competition')}
            className={`${styles.sortButton} ${
              sortBy === 'competition' ? styles.active : ''
            }`}
          >
            依競賽時間
          </button>
          <button
            onClick={() => setSortBy('registration')}
            className={`${styles.sortButton} ${
              sortBy === 'registration' ? styles.active : ''
            }`}
          >
            依報名截止
          </button>
        </div>
      </div>

      {/* 時間線內容 */}
      <div className={styles.timeline}>
        {timelineGroups.map((group, groupIndex) => (
          <div key={group.date} className={styles.timelineGroup}>
            {/* 日期節點 - 使用新的 DateSection 元件 */}
            <DateSection
              group={group}
              groupIndex={groupIndex}
              totalGroups={timelineGroups.length}
              sortBy={sortBy}
            />

            {/* 競賽卡片 */}
            <div className={styles.competitionsSection}>
              <div className={styles.competitionCards}>
                {group.competitions.map((competition) => (
                  <CompetitionCard
                    key={competition.id}
                    competition={competition}
                    className={styles.timelineCard}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 沒有有效日期的競賽 */}
      {(() => {
        const competitionsWithoutDate = competitions.filter(
          (comp) => !getCompetitionKeyDate(comp, sortBy),
        )

        if (competitionsWithoutDate.length > 0) {
          const pendingGroup: TimelineGroup = {
            date: 'pending',
            displayDate: '日期待定',
            competitions: competitionsWithoutDate,
          }

          return (
            <div className={styles.timelineGroup}>
              <DateSection
                group={pendingGroup}
                groupIndex={timelineGroups.length}
                totalGroups={timelineGroups.length + 1}
                sortBy={sortBy}
              />
              <div className={styles.competitionsSection}>
                <div className={styles.competitionCards}>
                  {competitionsWithoutDate.map((competition) => (
                    <CompetitionCard
                      key={competition.id}
                      competition={competition}
                      className={styles.timelineCard}
                    />
                  ))}
                </div>
              </div>
            </div>
          )
        }
        return null
      })()}
    </div>
  )
}
