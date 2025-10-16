'use client'

import React, { useState, useEffect } from 'react'
import styles from './competitions.module.scss'
// component
import CompetitionTimeline from '../components/CompetitionTimeline'
import Loading from '../components/Loading/Loading'
// type
import { Competition } from '../types/competition'
// util
import { getAllCompetitions } from '../utils/competitionService'

/**
 * [Component] 競賽資訊頁面 Client 元件
 */
export default function CompetitionsClient() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 載入競賽資料
  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        setLoading(true)
        setError(null)

        // 取得所有競賽
        const data = await getAllCompetitions()

        // 過濾已發布的競賽並排序
        const filteredData = data
          .filter((competition) => competition.published)
          .sort((a, b) => {
            // 先按優先級排序
            if (a.priority !== b.priority) {
              return a.priority - b.priority
            }
            // 優先級相同時按建立時間排序
            const dateA = new Date(a.createdAt.date || '').getTime()
            const dateB = new Date(b.createdAt.date || '').getTime()
            return dateB - dateA
          })

        setCompetitions(filteredData)
      } catch (err) {
        console.error('Error loading competitions:', err)
        setError(err instanceof Error ? err.message : '載入競賽資料失敗')
      } finally {
        setLoading(false)
      }
    }

    loadCompetitions()
  }, [])

  return (
    <div className={styles.competitionsContent}>
      {/* 競賽時間線 */}
      {!loading && !error && (
        <CompetitionTimeline
          competitions={competitions}
          defaultSortBy="competition"
        />
      )}

      {/* 錯誤狀態與載入狀態 */}
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
      {loading && <Loading text="正在載入競賽資料" />}
    </div>
  )
}
