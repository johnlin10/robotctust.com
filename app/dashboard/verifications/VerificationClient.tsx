'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import styles from './verification.module.scss'

// utils
import { createClient } from '@/app/utils/supabase/client'

interface VerificationItem {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  user_id: string
  course_id: string
  users: {
    student_id: string | null
    display_name: string | null
    username: string | null
  } | null
  courses: {
    id: string
    name: string
  } | null
}

/**
 * [Component] 課程審核中控台
 * @returns 課程審核中控台
 */
export default function VerificationClient() {
  // 建立 Supabase Client
  const supabase = useMemo(() => createClient(), [])
  // 待審核的課程驗證項目列表
  const [pendingRows, setPendingRows] = useState<VerificationItem[]>([])
  // 最近已處理的課程驗證項目列表
  const [processedRows, setProcessedRows] = useState<VerificationItem[]>([])
  // 是否正在載入
  const [loading, setLoading] = useState(true)
  // 正在處理的課程驗證項目 ID
  const [processingId, setProcessingId] = useState<string | null>(null)
  // 訊息
  const [message, setMessage] = useState('')

  /**
   * [Function] 獲取待審核的課程驗證項目
   */
  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/verifications/pending')
      const data = (await res.json()) as
        | { rows: VerificationItem[] }
        | { error: string }

      if (!res.ok || 'error' in data) {
        throw new Error('error' in data ? data.error : '取得待審核清單失敗')
      }

      setPendingRows(data.rows)
    } catch (error) {
      console.error('Fetch pending error:', error)
    }
  }, [])

  /**
   * [Function] 獲取最近已處理的課程驗證項目
   */
  const fetchProcessed = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/verifications/processed')
      const data = (await res.json()) as
        | { rows: VerificationItem[] }
        | { error: string }

      if (!res.ok || 'error' in data) {
        throw new Error('error' in data ? data.error : '取得已處理清單失敗')
      }

      setProcessedRows(data.rows)
    } catch (error) {
      console.error('Fetch processed error:', error)
    }
  }, [])

  /**
   * [Function] 初始化獲取資料
   */
  const fetchAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchPending(), fetchProcessed()])
    setLoading(false)
  }, [fetchPending, fetchProcessed])

  /**
   * [Effect] 獲取課程驗證項目並監聽變化
   */
  useEffect(() => {
    void fetchAll()

    // 建立 Supabase Channel
    const channel = supabase
      .channel('dashboard-verifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'course_verifications',
        },
        () => {
          void fetchPending()
          void fetchProcessed()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchAll, fetchPending, fetchProcessed])

  /**
   * [Function] 處理課程驗證項目 (核准/退回)
   */
  async function handleAction(id: string, action: 'approve' | 'reject') {
    setProcessingId(id)
    setMessage('')

    try {
      const res = await fetch(`/api/dashboard/verifications/${id}/${action}`, {
        method: 'PATCH',
      })
      const data = (await res.json()) as { success?: boolean; error?: string }

      if (!res.ok || data.error) {
        throw new Error(
          data.error || `無法${action === 'approve' ? '核准' : '退回'}`,
        )
      }

      await Promise.all([fetchPending(), fetchProcessed()])
      setMessage(`驗證單 ${id} 已${action === 'approve' ? '核准' : '退回'}`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '操作失敗')
    } finally {
      setProcessingId(null)
    }
  }

  /**
   * [Function] 撤回課程驗證項目
   */
  async function handleRevoke(id: string) {
    if (!confirm('確定要撤回此審核紀錄嗎？狀態將會重設為待審核。')) return

    setProcessingId(id)
    setMessage('')

    try {
      const res = await fetch(`/api/dashboard/verifications/${id}/revoke`, {
        method: 'PATCH',
      })
      const data = (await res.json()) as { success?: boolean; error?: string }

      if (!res.ok || data.error) {
        throw new Error(data.error || '無法撤回審核')
      }

      await Promise.all([fetchPending(), fetchProcessed()])
      setMessage(`驗證單 ${id} 已撤回，並重新回到待審核清單`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '撤回失敗')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className={styles.wrapper}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <h2>課程審核中控台</h2>
          <p className={styles.heroDescription}>
            即時處理學員的課程完成驗證請求。
          </p>
        </div>
      </section>

      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>待審核請求</span>
          <strong className={styles.statValue}>{pendingRows.length}</strong>
        </article>
      </section>

      {message ? (
        <div className={styles.message} aria-live="polite">
          {message}
        </div>
      ) : null}

      {loading ? (
        <div className={styles.emptyState}>正在載入審核清單…</div>
      ) : null}

      {!loading && (
        <>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>待審核清單</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>送審時間</th>
                    <th>課程</th>
                    <th>學員</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRows.map((row) => (
                    <tr key={row.id}>
                      <td className={styles.timestamp}>
                        {new Date(row.created_at).toLocaleString('zh-TW', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className={styles.courseName}>
                        {row.courses?.name || row.course_id}
                      </td>
                      <td>
                        <div className={styles.studentInfo}>
                          <span className={styles.studentName}>
                            {row.users?.display_name ||
                              row.users?.username ||
                              row.user_id}
                          </span>
                          <span className={styles.studentId}>
                            {row.users?.student_id || '-'}
                          </span>
                        </div>
                      </td>
                      <td className={styles.actions}>
                        <button
                          disabled={processingId === row.id}
                          onClick={() => void handleAction(row.id, 'approve')}
                        >
                          核准
                        </button>
                        <button
                          disabled={processingId === row.id}
                          onClick={() => void handleAction(row.id, 'reject')}
                        >
                          退回
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!pendingRows.length && (
                <p className={styles.emptyState}>目前沒有待審核請求。</p>
              )}
            </div>
          </section>

          <section className={styles.section} style={{ marginTop: '2rem' }}>
            <h3 className={styles.sectionTitle}>最近已認證紀錄</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>送審時間</th>
                    <th>課程</th>
                    <th>學員</th>
                    <th>狀態</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {processedRows.map((row) => (
                    <tr key={row.id}>
                      <td className={styles.timestamp}>
                        {new Date(row.created_at).toLocaleString('zh-TW', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className={styles.courseName}>
                        {row.courses?.name || row.course_id}
                      </td>
                      <td>
                        <div className={styles.studentInfo}>
                          <span className={styles.studentName}>
                            {row.users?.display_name ||
                              row.users?.username ||
                              row.user_id}
                          </span>
                          <span className={styles.studentId}>
                            {row.users?.student_id || '-'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[row.status]}`}>
                          {row.status === 'approved' ? '已核准' : '已退回'}
                        </span>
                      </td>
                      <td className={styles.actions}>
                        <button
                          disabled={processingId === row.id}
                          onClick={() => void handleRevoke(row.id)}
                        >
                          撤回
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!processedRows.length && (
                <p className={styles.emptyState}>目前沒有已處理的紀錄。</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
