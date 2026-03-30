'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useToast } from '@/app/contexts/ToastContext'
import styles from './CourseVerification.module.scss'
import Loading from '@/app/components/Loading/Loading'

interface CourseVerificationProps {
  courseId: string
}

type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected'

export const CourseVerification: React.FC<CourseVerificationProps> = ({ courseId }) => {
  const { user, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const [status, setStatus] = useState<VerificationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/verify`)
      const data = await res.json()
      if (data.verification) {
        setStatus(data.verification.status)
      } else {
        setStatus('none')
      }
    } catch (error) {
      console.error('Failed to fetch verification status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      fetchStatus()
    } else if (!authLoading && !user) {
      setLoading(false)
      setStatus('none')
    }
  }, [authLoading, user, courseId])

  const handleApply = async () => {
    if (!user) {
      showToast('請先登入以申請審核', 'error')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/courses/${courseId}/verify`, {
        method: 'POST',
      })
      const data = await res.json()

      if (res.ok) {
        showToast('申請成功，請等待管理員審核', 'success')
        setStatus('pending')
      } else {
        showToast(data.error || '申請失敗', 'error')
      }
    } catch (error) {
      showToast('發生錯誤，請稍後再試', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.verificationContainer}>
        <Loading text="正在確認審核狀態..." />
      </div>
    )
  }

  if (!user) {
    return (
      <div className={styles.verificationContainer}>
        <div className={styles.header}>
          <h3>課程審核</h3>
          <p>登入後即可申請課程審核以取得認證。</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.verificationContainer}>
      <div className={styles.header}>
        <h3>課程審核</h3>
        <p>
          {status === 'approved' 
            ? '恭喜！您已通過此課程的審核。' 
            : '完成課程內容後，您可以申請審核以取得認證。'}
        </p>
      </div>

      <div className={styles.content}>
        {status === 'none' && (
          <button 
            className={styles.applyButton} 
            onClick={handleApply}
            disabled={submitting}
          >
            {submitting ? '提交中...' : '立即申請審核'}
          </button>
        )}

        {status === 'pending' && (
          <div className={`${styles.statusBadge} ${styles.pending}`}>
            審核中
          </div>
        )}

        {status === 'approved' && (
          <div className={`${styles.statusBadge} ${styles.approved}`}>
            已通過審核
          </div>
        )}

        {status === 'rejected' && (
          <div className={styles.rejectedContainer}>
            <div className={`${styles.statusBadge} ${styles.rejected}`}>
              審核未通過
            </div>
            <button 
              className={styles.applyButton} 
              onClick={handleApply}
              disabled={submitting}
            >
              {submitting ? '提交中...' : '重新申請審核'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
