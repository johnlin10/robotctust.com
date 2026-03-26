'use client'

import React, { useState, useEffect, useContext, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUsers,
  faLock,
  faSpinner,
  faSync,
  faDatabase,
  faCheck,
  faExclamationTriangle,
  faSave
} from '@fortawesome/free-solid-svg-icons'
import styles from './admin.module.scss'
import Page from '../components/page/Page'
import { AuthContext } from '../contexts/AuthContext'
import { batchSyncCompetitions } from '../utils/competitionService'
import { forceSyncClassEvents } from '../utils/classScheduleService'
import { competitions } from '../competitions/Competitions'
import { schedules } from '../schedules/Schedules'
import { fetchAllUsers, updateUserRoles } from './actions'
import { UserRole } from '../types/user'
import Selector from '../components/Selector/Selector'

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'super_admin', label: '超級管理員' },
  { value: 'admin', label: '一般管理員' },
  { value: 'admin_course', label: '課程發布' },
  { value: 'admin_achievement', label: '成就審核' },
  { value: 'admin_verifications', label: '認證審查' },
  { value: 'admin_news', label: '新聞發布' },
  { value: 'member', label: '一般會員' },
]

export default function AdminPageClient() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('AdminPage must be used within an AuthProvider')
  }
  const {
    user,
    supabaseUser,
    isSuperAdmin: isCurrentUserSuperAdmin,
    loading: authLoading,
  } = context
  
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingUserId, setSavingUserId] = useState<string | null>(null)

  const [syncStatus, setSyncStatus] = useState<
    'idle' | 'syncing' | 'success' | 'error'
  >('idle')
  const [syncResult, setSyncResult] = useState<{
    success: number
    errors: string[]
  } | null>(null)

  const [classSyncStatus, setClassSyncStatus] = useState<
    'idle' | 'syncing' | 'success' | 'error'
  >('idle')
  const [classSyncResult, setClassSyncResult] = useState<{
    success: number
    errors: string[]
  } | null>(null)

  const loadUsers = useCallback(async () => {
    if (!supabaseUser) return

    try {
      setLoading(true)
      setError(null)
      const data = await fetchAllUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
      setError(error instanceof Error ? error.message : '載入失敗')
    } finally {
      setLoading(false)
    }
  }, [supabaseUser])

  const handleRolesChange = (targetUserId: string, newRoles: UserRole[]) => {
    setUsers(prev => prev.map(u => {
      if (u.id === targetUserId) {
        if (newRoles.length === 0) newRoles = ['member']
        return { ...u, roles: newRoles }
      }
      return u
    }))
  }

  const handleSaveRoles = async (targetUserId: string, newRoles: string[]) => {
    try {
      setSavingUserId(targetUserId)
      setError(null)
      await updateUserRoles(targetUserId, newRoles)
      alert('權限已成功更新！')
    } catch (err: any) {
      console.error('Save roles error:', err)
      setError(err.message || '儲存失敗')
      // re-fetch 確保畫面重置，避免與資料庫脫鉤
      await loadUsers()
    } finally {
      setSavingUserId(null)
    }
  }

  const handleSyncCompetitions = async () => {
    if (!supabaseUser) return

    const confirmed = window.confirm(
      `確定要同步 ${competitions.length} 個競賽到 Firestore 嗎？\n這將會覆蓋現有的競賽資料。`
    )
    if (!confirmed) return

    try {
      setSyncStatus('syncing')
      setSyncResult(null)
      setError(null)

      const result = await batchSyncCompetitions(competitions, supabaseUser.id)
      setSyncResult(result)

      if (result.errors.length > 0) {
        setSyncStatus('error')
        setError(
          `同步完成，但有 ${
            result.errors.length
          } 個錯誤：\n${result.errors.join('\n')}`
        )
      } else {
        setSyncStatus('success')
      }
    } catch (error) {
      console.error('Error syncing competitions:', error)
      setSyncStatus('error')
      setError(error instanceof Error ? error.message : '同步失敗')
    }
  }

  const handleSyncClassSchedule = async () => {
    if (!supabaseUser) return

    const confirmed = window.confirm(
      `確定要強制完全同步 ${schedules.length} 個課程行程到 Firestore 嗎？\n\n⚠️ 警告：此操作將會：\n1. 刪除 Firestore 中所有現有的課程資料\n2. 重新添加本地的所有課程資料\n\n這是不可逆的操作，請確認您要繼續。`
    )
    if (!confirmed) return

    try {
      setClassSyncStatus('syncing')
      setClassSyncResult(null)
      setError(null)

      const result = await forceSyncClassEvents(schedules, supabaseUser.id)
      setClassSyncResult(result)

      if (result.errors.length > 0) {
        setClassSyncStatus('error')
        setError(
          `課程強制同步完成，但有 ${
            result.errors.length
          } 個錯誤：\n${result.errors.join('\n')}`
        )
      } else {
        setClassSyncStatus('success')
      }
    } catch (error) {
      console.error('Error force syncing class schedule:', error)
      setClassSyncStatus('error')
      setError(error instanceof Error ? error.message : '課程強制同步失敗')
    }
  }

  useEffect(() => {
    if (!authLoading && supabaseUser && isCurrentUserSuperAdmin) {
      void loadUsers()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [supabaseUser, isCurrentUserSuperAdmin, authLoading, loadUsers])

  if (authLoading || (loading && !error)) {
    return (
      <Page style={styles.adminContainer}>
        <div className={styles.adminContent}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <span>載入中...</span>
          </div>
        </div>
      </Page>
    )
  }

  if (!isCurrentUserSuperAdmin) {
    return (
      <Page style={styles.adminContainer}>
        <div className={styles.adminContent}>
          <div className={styles.accessDenied}>
            <FontAwesomeIcon icon={faLock} className={styles.accessIcon} />
            <h2>存取被拒絕</h2>
            <p>
              您沒有權限存取管理員頁面。
              <br />
              只有超級管理員可以管理使用者權限。
            </p>
          </div>
        </div>
      </Page>
    )
  }

  return (
    <Page style={styles.adminContainer}>
      <div className={styles.adminContent}>
        <div className={styles.header}>
          <div>
            <h1>系統控制台</h1>
            <div className={styles.adminInfo}>
              <span className={styles.adminBadge}>超級管理員</span>
              <span>{supabaseUser?.email}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className={styles.errorState}>
            <p>{error}</p>
          </div>
        )}

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faUsers} /> 使用者角色設定
          </h2>
          <p className={styles.sectionDescription}>
            管理所有使用者的權限，打勾選擇並儲存即可賦予權限（目前綁定 Supabase public.users 陣列架構）。
          </p>

          <div className={styles.tableContainer}>
            <table className={styles.rolesTable}>
              <thead>
                <tr>
                  <th style={{ minWidth: '200px' }}>使用者 (User)</th>
                  <th style={{ minWidth: '150px' }}>信箱 (Email)</th>
                  <th style={{ minWidth: '250px' }}>權限分配 (Roles)</th>
                  <th style={{ textAlign: 'center', minWidth: '100px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className={styles.userCell}>
                        <span className={styles.name}>{u.display_name || u.username || '未知身分'}</span>
                        {u.id === supabaseUser?.id && <span style={{ color: '#00D1FF', fontSize: '0.75rem', fontWeight: 'bold' }}>（您的帳號）</span>}
                      </div>
                    </td>
                    <td>
                      <span className={styles.email}>{u.email}</span>
                    </td>
                    <td>
                      <Selector<UserRole>
                        mode="multiple"
                        options={ROLE_OPTIONS}
                        values={Array.isArray(u.roles) ? u.roles as UserRole[] : ['member']}
                        onMultipleChange={(vals) => handleRolesChange(u.id, vals)}
                        placeholder="請選擇權限..."
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => handleSaveRoles(u.id, u.roles || ['member'])}
                        className={styles.syncButton}
                        disabled={savingUserId === u.id}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: 'auto', minWidth: '90px' }}
                      >
                        {savingUserId === u.id ? <><FontAwesomeIcon icon={faSpinner} spin /> 儲存中</> : <><FontAwesomeIcon icon={faSave} /> 儲存</>}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.6 }}>
                      目前資料庫沒有記錄任何使用者。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faDatabase} /> 競賽資料同步
          </h2>
          <p className={styles.sectionDescription}>
            將本地 Competitions.ts 中的競賽資料同步到 Firestore 雲端資料庫。
            <br />
            <strong>注意：</strong>此操作將會覆蓋雲端資料庫中現有的競賽資料。
          </p>

          <div className={styles.syncSection}>
            <div className={styles.syncInfo}>
              <div className={styles.syncStats}>
                <span className={styles.statItem}>
                  <strong>{competitions.length}</strong> 個競賽待同步
                </span>
                {syncResult && (
                  <>
                    <span className={styles.statItem}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className={styles.successIcon}
                      />
                      成功: {syncResult.success}
                    </span>
                    {syncResult.errors.length > 0 && (
                      <span className={styles.statItem}>
                        <FontAwesomeIcon
                          icon={faExclamationTriangle}
                          className={styles.errorIcon}
                        />
                        錯誤: {syncResult.errors.length}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleSyncCompetitions}
              className={styles.syncButton}
              disabled={syncStatus === 'syncing'}
            >
              {syncStatus === 'syncing' ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>同步中...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSync} />
                  <span>同步競賽資料</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faDatabase} /> 課程資料同步
          </h2>
          <p className={styles.sectionDescription}>
            將本地 Schedules.ts 中的課程行程強制同步到 Firestore 雲端資料庫。
            <br />
            <strong>注意：</strong>此操作會先刪除既有資料，再重新寫入全部課程資料。
          </p>

          <div className={styles.syncSection}>
            <div className={styles.syncInfo}>
              <div className={styles.syncStats}>
                <span className={styles.statItem}>
                  <strong>{schedules.length}</strong> 個課程待同步
                </span>
                {classSyncResult && (
                  <>
                    <span className={styles.statItem}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className={styles.successIcon}
                      />
                      成功: {classSyncResult.success}
                    </span>
                    {classSyncResult.errors.length > 0 && (
                      <span className={styles.statItem}>
                        <FontAwesomeIcon
                          icon={faExclamationTriangle}
                          className={styles.errorIcon}
                        />
                        錯誤: {classSyncResult.errors.length}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleSyncClassSchedule}
              className={styles.syncButton}
              disabled={classSyncStatus === 'syncing'}
            >
              {classSyncStatus === 'syncing' ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>同步中...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faDatabase} />
                  <span>同步課程資料</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Page>
  )
}
