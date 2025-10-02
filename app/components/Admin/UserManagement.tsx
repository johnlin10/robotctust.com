'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useAuth } from '../../contexts/AuthContext'
import {
  getUserStats,
  advancedSearchUsers,
  toggleUserAccount,
  verifyUserAccount,
  deleteUserData,
} from '../../utils/userManagementService'
import { UserSearchResult } from '../../types/user'
import styles from './UserManagement.module.scss'

/**
 * [Component] 使用者管理面板
 * 提供管理員管理使用者的功能
 */
export const UserManagement: React.FC = () => {
  const { user, isAdmin, isSuperAdmin } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    verifiedUsers: 0,
  })
  const [users, setUsers] = useState<UserSearchResult[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    role: undefined as 'super_admin' | 'admin' | 'user' | undefined,
    isActive: undefined as boolean | undefined,
    isVerified: undefined as boolean | undefined,
    provider: undefined as 'email' | 'google' | undefined,
  })
  const [loading, setLoading] = useState(false)

  //* 載入統計資料
  const loadStats = useCallback(async () => {
    try {
      const statsData = await getUserStats()
      setStats(statsData)
    } catch (error) {
      console.error('載入統計資料失敗:', error)
    }
  }, [])

  //* 搜尋使用者
  const searchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const results = await advancedSearchUsers(searchTerm, filters)
      setUsers(results)
    } catch (error) {
      console.error('搜尋使用者失敗:', error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, filters])

  //* 切換使用者帳號狀態
  const handleToggleAccount = async (uid: string, isActive: boolean) => {
    if (!user) return

    try {
      await toggleUserAccount(uid, isActive, user.uid)
      await searchUsers() // 重新載入使用者列表
    } catch (error) {
      console.error('切換帳號狀態失敗:', error)
      alert('操作失敗，請稍後再試')
    }
  }

  //* 驗證使用者帳號
  const handleVerifyAccount = async (uid: string) => {
    if (!user) return

    try {
      await verifyUserAccount(uid, user.uid)
      await searchUsers() // 重新載入使用者列表
    } catch (error) {
      console.error('驗證帳號失敗:', error)
      alert('操作失敗，請稍後再試')
    }
  }

  //* 刪除使用者資料
  const handleDeleteUser = async (uid: string) => {
    if (!user || !isSuperAdmin) return

    if (!confirm('確定要刪除此使用者的資料嗎？此操作無法復原。')) {
      return
    }

    try {
      await deleteUserData(uid, user.uid)
      await searchUsers() // 重新載入使用者列表
    } catch (error) {
      console.error('刪除使用者失敗:', error)
      alert('操作失敗，請稍後再試')
    }
  }

  // 初始載入
  useEffect(() => {
    loadStats()
    searchUsers()
  }, [loadStats, searchUsers])

  // 搜尋條件變更時重新搜尋
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers()
    }, 500) // 防抖動

    return () => clearTimeout(timeoutId)
  }, [searchUsers])

  // 檢查權限
  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className={styles.no_permission}>
        <h2>權限不足</h2>
        <p>您沒有權限存取此頁面</p>
      </div>
    )
  }

  return (
    <div className={styles.user_management}>
      <div className={styles.header}>
        <h1>使用者管理</h1>
        <button onClick={loadStats} className={styles.refresh_button}>
          重新整理統計
        </button>
      </div>

      {/* 統計資料 */}
      <div className={styles.stats_grid}>
        <div className={styles.stat_card}>
          <h3>總使用者數</h3>
          <div className={styles.stat_number}>{stats.totalUsers}</div>
        </div>
        <div className={styles.stat_card}>
          <h3>活躍使用者</h3>
          <div className={styles.stat_number}>{stats.activeUsers}</div>
        </div>
        <div className={styles.stat_card}>
          <h3>本月新增</h3>
          <div className={styles.stat_number}>{stats.newUsersThisMonth}</div>
        </div>
        <div className={styles.stat_card}>
          <h3>已驗證使用者</h3>
          <div className={styles.stat_number}>{stats.verifiedUsers}</div>
        </div>
      </div>

      {/* 搜尋和篩選 */}
      <div className={styles.search_section}>
        <div className={styles.search_bar}>
          <input
            type="text"
            placeholder="搜尋使用者名稱、暱稱或簡介..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.search_input}
          />
        </div>

        <div className={styles.filters}>
          <select
            value={filters.role || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                role:
                  (e.target.value as 'super_admin' | 'admin' | 'user') ||
                  undefined,
              })
            }
            className={styles.filter_select}
          >
            <option value="">所有角色</option>
            <option value="user">一般使用者</option>
            <option value="admin">管理員</option>
            <option value="super_admin">超級管理員</option>
          </select>

          <select
            value={
              filters.isActive === undefined ? '' : filters.isActive.toString()
            }
            onChange={(e) =>
              setFilters({
                ...filters,
                isActive:
                  e.target.value === '' ? undefined : e.target.value === 'true',
              })
            }
            className={styles.filter_select}
          >
            <option value="">所有狀態</option>
            <option value="true">啟用</option>
            <option value="false">停用</option>
          </select>

          <select
            value={filters.provider || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                provider: (e.target.value as 'email' | 'google') || undefined,
              })
            }
            className={styles.filter_select}
          >
            <option value="">所有登入方式</option>
            <option value="email">電子郵件</option>
            <option value="google">Google</option>
          </select>
        </div>
      </div>

      {/* 使用者列表 */}
      <div className={styles.users_section}>
        {loading ? (
          <div className={styles.loading}>載入中...</div>
        ) : (
          <div className={styles.users_grid}>
            {users.map((user) => (
              <div key={user.uid} className={styles.user_card}>
                <div className={styles.user_info}>
                  <Image
                    src={user.photoURL}
                    alt={user.displayName}
                    className={styles.user_avatar}
                    width={50}
                    height={50}
                  />
                  <div className={styles.user_details}>
                    <h4>{user.displayName}</h4>
                    <p>@{user.username}</p>
                    {user.bio && <p className={styles.user_bio}>{user.bio}</p>}
                    {user.isVerified && (
                      <span className={styles.verified_badge}>已驗證</span>
                    )}
                  </div>
                </div>

                <div className={styles.user_actions}>
                  <button
                    onClick={() => handleVerifyAccount(user.uid)}
                    className={styles.verify_button}
                    disabled={user.isVerified}
                  >
                    {user.isVerified ? '已驗證' : '驗證'}
                  </button>

                  <button
                    onClick={() => handleToggleAccount(user.uid, true)}
                    className={styles.activate_button}
                  >
                    啟用
                  </button>

                  <button
                    onClick={() => handleToggleAccount(user.uid, false)}
                    className={styles.deactivate_button}
                  >
                    停用
                  </button>

                  {isSuperAdmin && (
                    <button
                      onClick={() => handleDeleteUser(user.uid)}
                      className={styles.delete_button}
                    >
                      刪除
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className={styles.no_results}>
            <p>沒有找到符合條件的使用者</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserManagement
