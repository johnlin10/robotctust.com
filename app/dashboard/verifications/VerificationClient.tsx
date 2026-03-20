'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './verification.module.scss'

// utils
import { createClient } from '@/app/utils/supabase/client'

interface PendingVerificationItem {
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
  const [rows, setRows] = useState<PendingVerificationItem[]>([])
  // 是否正在載入
  const [loading, setLoading] = useState(true)
  // 正在處理的課程驗證項目 ID
  const [processingId, setProcessingId] = useState<string | null>(null)
  // 訊息
  const [message, setMessage] = useState('')

  /**
   * [Function] 獲取待審核的課程驗證項目
   */
  async function fetchPending() {
    try {
      // 獲取待審核的課程驗證項目
      const res = await fetch('/api/dashboard/verifications/pending')
      // 解析回應
      const data = (await res.json()) as
        | { rows: PendingVerificationItem[] }
        | { error: string }

      if (!res.ok || 'error' in data) {
        throw new Error('error' in data ? data.error : '取得待審核清單失敗')
      }

      setRows(data.rows)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '讀取資料失敗')
    } finally {
      setLoading(false)
    }
  }

  /**
   * [Effect] 獲取待審核的課程驗證項目
   */
  useEffect(() => {
    // 獲取待審核的課程驗證項目
    void fetchPending()

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
        },
      )
      .subscribe()

    // 建立定時器
    const timer = setInterval(() => {
      void fetchPending()
    }, 60000) // 每 60 秒獲取一次

    return () => {
      clearInterval(timer) // 清除定時器
      supabase.removeChannel(channel) // 移除 Supabase Channel
    }
  }, [supabase])

  /**
   * [Function] 處理課程驗證項目
   */
  async function handleAction(id: string, action: 'approve' | 'reject') {
    setProcessingId(id)
    setMessage('')

    // 處理課程驗證項目
    try {
      // 發送請求
      const res = await fetch(`/api/dashboard/verifications/${id}/${action}`, {
        method: 'PATCH',
      })
      // 解析回應
      const data = (await res.json()) as { success?: boolean; error?: string }

      if (!res.ok || data.error) {
        throw new Error(
          data.error || `無法${action === 'approve' ? '核准' : '退回'}`,
        )
      }

      // 獲取待審核的課程驗證項目
      await fetchPending()

      setMessage(`驗證單 ${id} 已${action === 'approve' ? '核准' : '退回'}`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '操作失敗')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h2>課程審核中控台</h2>
        <p>顯示所有待審核請求，並由現場助教即時處理。</p>
      </header>

      {message ? <p className={styles.message}>{message}</p> : null}
      {loading ? <p>載入中...</p> : null}

      {!loading && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>送審時間</th>
                <th>課程</th>
                <th>學員</th>
                <th>學號</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.created_at).toLocaleString('zh-TW')}</td>
                  <td>{row.courses?.name || row.course_id}</td>
                  <td>
                    {row.users?.display_name ||
                      row.users?.username ||
                      row.user_id}
                  </td>
                  <td>{row.users?.student_id || '-'}</td>
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
          {!rows.length && <p className={styles.empty}>目前沒有待審核請求。</p>}
        </div>
      )}
    </div>
  )
}
