'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import styles from './verification.module.scss'

// utils
import { createClient } from '@/app/utils/supabase/client'
import { useToast } from '@/app/contexts/ToastContext'
import { Modal } from '@/app/[locale]/dashboard/components/Modal'
import { Skeleton } from '@/app/components/Skeleton'

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
  const { showToast } = useToast()
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
  // 等待撤回確認的驗證單 ID
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null)
  // 本次 realtime 更新中新出現的 ID（用於 highlight 動畫）
  const [newIds, setNewIds] = useState<Set<string>>(new Set())
  const prevPendingIdsRef = useRef<Set<string>>(new Set())

  /**
   * [Function] 獲取待審核的課程驗證項目
   * @param highlight 是否偵測並 highlight 新進的資料列（realtime 更新時傳 true）
   */
  const fetchPending = useCallback(async (highlight = false) => {
    try {
      const res = await fetch('/api/dashboard/verifications/pending')
      const data = (await res.json()) as
        | { rows: VerificationItem[] }
        | { error: string }

      if (!res.ok || 'error' in data) {
        throw new Error('error' in data ? data.error : '取得待審核清單失敗')
      }

      if (highlight) {
        const incoming = new Set(data.rows.map((r) => r.id))
        const fresh = [...incoming].filter((id) => !prevPendingIdsRef.current.has(id))
        if (fresh.length > 0) {
          setNewIds(new Set(fresh))
          // 2 秒後清除 highlight，避免重複觸發動畫
          setTimeout(() => setNewIds(new Set()), 2000)
        }
        prevPendingIdsRef.current = incoming
      } else {
        prevPendingIdsRef.current = new Set(data.rows.map((r) => r.id))
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
          void fetchPending(true)
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
      showToast(
        `驗證單已${action === 'approve' ? '核准' : '退回'}`,
        'success',
      )
    } catch (error) {
      showToast(error instanceof Error ? error.message : '操作失敗', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  /**
   * [Function] 撤回課程驗證項目（確認後執行）
   */
  async function confirmRevoke() {
    if (!revokeTarget) return
    const id = revokeTarget
    setRevokeTarget(null)
    setProcessingId(id)

    try {
      const res = await fetch(`/api/dashboard/verifications/${id}/revoke`, {
        method: 'PATCH',
      })
      const data = (await res.json()) as { success?: boolean; error?: string }

      if (!res.ok || data.error) {
        throw new Error(data.error || '無法撤回審核')
      }

      await Promise.all([fetchPending(), fetchProcessed()])
      showToast('已撤回，驗證單重新回到待審核清單', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : '撤回失敗', 'error')
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

      {loading ? (
        <>
          <Skeleton variant="stat"      count={1} layout="row" />
          <Skeleton variant="table-row" count={5} layout="list" />
        </>
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
                    <tr
                      key={row.id}
                      className={newIds.has(row.id) ? styles.newRow : undefined}
                    >
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
                          onClick={() => setRevokeTarget(row.id)}
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

      <Modal
        isOpen={revokeTarget !== null}
        onClose={() => setRevokeTarget(null)}
        title="確認撤回"
        maxWidth="480px"
        footer={
          <>
            <button onClick={() => setRevokeTarget(null)}>取消</button>
            <button onClick={() => void confirmRevoke()}>確認撤回</button>
          </>
        }
      >
        <p>確定要撤回此審核紀錄嗎？該驗證單的狀態將會重設為待審核。</p>
      </Modal>
    </div>
  )
}
