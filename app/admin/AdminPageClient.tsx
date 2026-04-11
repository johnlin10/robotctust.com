'use client'

import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react'
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
import { UserRole, getUserRoleName, UserProfile } from '../types/user'
import Selector from '../components/Selector/Selector'
import { useToast } from '../contexts/ToastContext'

// 自動生成選項，確保與 getUserRoleName 同步
const ALL_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'admin_course',
  'admin_achievement',
  'admin_verifications',
  'admin_news',
  'admin_accounts',
  'admin_members',
  'member'
]

const ROLE_OPTIONS = ALL_ROLES.map(role => ({
  value: role,
  label: getUserRoleName(role)
}))

export default function AdminPageClient() {
  const { showToast } = useToast()
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('AdminPage must be used within an AuthProvider')
  }

  const {
    supabaseUser,
    isSuperAdmin: isCurrentUserSuperAdmin,
    loading: authLoading,
  } = context
  
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [savingUserId, setSavingUserId] = useState<string | null>(null)

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [syncResult, setSyncResult] = useState<{ success: number; errors: string[] } | null>(null)

  const [classSyncStatus, setClassSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [classSyncResult, setClassSyncResult] = useState<{ success: number; errors: string[] } | null>(null)

  const loadUsers = useCallback(async () => {
    if (!supabaseUser) return
    try {
      setLoading(true)
      const data = await fetchAllUsers()
      setUsers(data)
    } catch (error) {
      showToast(error instanceof Error ? error.message : '載入使用者失敗', 'error')
    } finally {
      setLoading(false)
    }
  }, [supabaseUser, showToast])

  useEffect(() => {
    if (!authLoading && supabaseUser && isCurrentUserSuperAdmin) {
      void loadUsers()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [supabaseUser, isCurrentUserSuperAdmin, authLoading, loadUsers])

  const handleRolesChange = (targetUserId: string, newRoles: UserRole[]) => {
    setUsers(prev => prev.map(u => {
      if (u.id === targetUserId) {
        const finalRoles = newRoles.length === 0 ? ['member'] : newRoles
        return { ...u, roles: finalRoles }
      }
      return u
    }))
  }

  const handleSaveRoles = async (targetUserId: string, newRoles: UserRole[]) => {
    try {
      setSavingUserId(targetUserId)
      await updateUserRoles(targetUserId, newRoles)
      showToast('權限已成功更新', 'success')
    } catch (err: any) {
      showToast(err.message || '儲存失敗', 'error')
      await loadUsers()
    } finally {
      setSavingUserId(null)
    }
  }

  const handleSyncCompetitions = async () => {
    if (!supabaseUser) return
    if (!window.confirm(`確定要同步 ${competitions.length} 個競賽到 Firestore 嗎？`)) return

    try {
      setSyncStatus('syncing')
      const result = await batchSyncCompetitions(competitions, supabaseUser.id)
      setSyncResult(result)
      if (result.errors.length > 0) {
        setSyncStatus('error')
        showToast(`同步完成，但有 ${result.errors.length} 個錯誤`, 'error')
      } else {
        setSyncStatus('success')
        showToast('競賽資料同步成功', 'success')
      }
    } catch (error) {
      setSyncStatus('error')
      showToast(error instanceof Error ? error.message : '同步失敗', 'error')
    }
  }

  const handleSyncClassSchedule = async () => {
    if (!supabaseUser) return
    if (!window.confirm('確定要強制完全同步課程行程嗎？此操作不可逆。')) return

    try {
      setClassSyncStatus('syncing')
      const result = await forceSyncClassEvents(schedules, supabaseUser.id)
      setClassSyncResult(result)
      if (result.errors.length > 0) {
        setClassSyncStatus('error')
        showToast(`課程同步完成，但有 ${result.errors.length} 個錯誤`, 'error')
      } else {
        setClassSyncStatus('success')
        showToast('課程資料同步成功', 'success')
      }
    } catch (error) {
      setClassSyncStatus('error')
      showToast(error instanceof Error ? error.message : '課程同步失敗', 'error')
    }
  }

  if (authLoading || loading) {
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
            <p>您沒有權限存取管理員頁面。</p>
          </div>
        </div>
      </Page>
    )
  }

  return (
    <Page style={styles.adminContainer}>
      <div className={styles.adminContent}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <h1>系統控制台</h1>
            <div className={styles.adminInfo}>
              <span className={styles.adminBadge}>超級管理員</span>
              <span className={styles.adminEmail}>{supabaseUser?.email}</span>
            </div>
          </div>
        </header>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faUsers} /> 使用者角色設定
            </h2>
            <p className={styles.sectionDescription}>
              管理所有使用者的權限，分配後點擊儲存即可生效。
            </p>
          </header>

          <div className={styles.tableContainer}>
            <table className={styles.rolesTable}>
              <thead>
                <tr>
                  <th>使用者</th>
                  <th>信箱</th>
                  <th style={{ width: '300px' }}>權限分配</th>
                  <th className={styles.center} style={{ width: '120px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className={styles.userCell}>
                        <span className={styles.userName}>{u.display_name || u.username || '未知身分'}</span>
                        {u.id === supabaseUser?.id && <span className={styles.selfBadge}>（您）</span>}
                      </div>
                    </td>
                    <td><span className={styles.email}>{u.email}</span></td>
                    <td>
                      <Selector<UserRole>
                        mode="multiple"
                        options={ROLE_OPTIONS}
                        values={Array.isArray(u.roles) ? u.roles : ['member']}
                        onMultipleChange={(vals) => handleRolesChange(u.id, vals)}
                        placeholder="請選擇權限..."
                      />
                    </td>
                    <td className={styles.center}>
                      <button 
                        onClick={() => void handleSaveRoles(u.id, u.roles || ['member'])}
                        className={styles.saveButton}
                        disabled={savingUserId === u.id}
                      >
                        {savingUserId === u.id ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                        <span>儲存</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className={styles.emptyRow}>目前沒有使用者資料。</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faDatabase} /> 資料同步工具
          </h2>
          
          <div className={styles.syncGrid}>
            <article className={styles.syncCard}>
              <h3>競賽資料同步</h3>
              <p>同步本地 Competitions.ts 至雲端。</p>
              <div className={styles.syncMeta}>
                <span>待同步: {competitions.length}</span>
                {syncStatus === 'success' && <span className={styles.successText}>已成功</span>}
              </div>
              <button
                onClick={() => void handleSyncCompetitions()}
                className={styles.syncButton}
                disabled={syncStatus === 'syncing'}
              >
                <FontAwesomeIcon icon={syncStatus === 'syncing' ? faSpinner : faSync} spin={syncStatus === 'syncing'} />
                同步競賽
              </button>
            </article>

            <article className={styles.syncCard}>
              <h3>課程行程同步</h3>
              <p>強制刷新雲端課程行程資料。</p>
              <div className={styles.syncMeta}>
                <span>待同步: {schedules.length}</span>
                {classSyncStatus === 'success' && <span className={styles.successText}>已成功</span>}
              </div>
              <button
                onClick={() => void handleSyncClassSchedule()}
                className={styles.syncButton}
                disabled={classSyncStatus === 'syncing'}
              >
                <FontAwesomeIcon icon={classSyncStatus === 'syncing' ? faSpinner : faDatabase} spin={classSyncStatus === 'syncing'} />
                同步課程
              </button>
            </article>
          </div>
        </section>
      </div>
    </Page>
  )
}
