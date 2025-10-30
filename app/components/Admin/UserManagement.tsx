'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useAuth } from '../../contexts/AuthContext'
import {
  getUserStats,
  advancedSearchUsers,
  getAllUsers,
  toggleUserAccount,
  verifyUserAccount,
  deleteUserData,
  updateUserRole,
  updateUserPermissions,
} from '../../utils/userManagementService'
import { UserProfile, UserPermissions } from '../../types/user'
import { canManageUserRole } from '../../utils/permissionService'
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
  const [users, setUsers] = useState<UserProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    role: undefined as 'super_admin' | 'info_admin' | 'club_officer' | 'user' | undefined,
    isActive: undefined as boolean | undefined,
    isVerified: undefined as boolean | undefined,
    provider: undefined as 'email' | 'google' | undefined,
  })
  const [loading, setLoading] = useState(false)
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set())

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
      // 使用 getAllUsers 獲取完整使用者資料（包含權限）
      const allUsers = await getAllUsers(100)
      
      // 應用篩選
      let filteredUsers = allUsers
      
      if (filters.role) {
        filteredUsers = filteredUsers.filter((u) => u.role === filters.role)
      }
      
      if (filters.isActive !== undefined) {
        filteredUsers = filteredUsers.filter((u) => u.isActive === filters.isActive)
      }
      
      if (filters.isVerified !== undefined) {
        filteredUsers = filteredUsers.filter((u) => u.isVerified === filters.isVerified)
      }
      
      if (filters.provider) {
        filteredUsers = filteredUsers.filter((u) => u.provider === filters.provider)
      }
      
      // 應用文字搜尋
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        filteredUsers = filteredUsers.filter((u) =>
          u.username.toLowerCase().includes(searchLower) ||
          u.displayName.toLowerCase().includes(searchLower) ||
          (u.bio && u.bio.toLowerCase().includes(searchLower))
        )
      }
      
      setUsers(filteredUsers)
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
      await toggleUserAccount(user, uid, isActive)
      await searchUsers() // 重新載入使用者列表
    } catch (error) {
      console.error('切換帳號狀態失敗:', error)
      alert(
        error instanceof Error ? error.message : '操作失敗，請稍後再試'
      )
    }
  }

  //* 驗證使用者帳號
  const handleVerifyAccount = async (uid: string) => {
    if (!user) return

    try {
      await verifyUserAccount(user, uid)
      await searchUsers() // 重新載入使用者列表
    } catch (error) {
      console.error('驗證帳號失敗:', error)
      alert(
        error instanceof Error ? error.message : '操作失敗，請稍後再試'
      )
    }
  }

  //* 刪除使用者資料
  const handleDeleteUser = async (uid: string) => {
    if (!user || !isSuperAdmin) return

    if (!confirm('確定要刪除此使用者的資料嗎？此操作無法復原。')) {
      return
    }

    try {
      await deleteUserData(user, uid)
      await searchUsers() // 重新載入使用者列表
    } catch (error) {
      console.error('刪除使用者失敗:', error)
      alert(
        error instanceof Error ? error.message : '操作失敗，請稍後再試'
      )
    }
  }

  //* 更新使用者身份
  const handleUpdateRole = async (
    targetUid: string,
    newRole: UserProfile['role']
  ) => {
    if (!user) return

    try {
      await updateUserRole(user, targetUid, newRole)
      await searchUsers() // 重新載入使用者列表
    } catch (error) {
      console.error('更新使用者身份失敗:', error)
      alert(
        error instanceof Error ? error.message : '操作失敗，請稍後再試'
      )
    }
  }

  //* 更新使用者權限
  const handleUpdatePermission = async (
    targetUid: string,
    permission: keyof UserPermissions,
    value: boolean
  ) => {
    if (!user) return

    try {
      await updateUserPermissions(user, targetUid, {
        [permission]: value,
      })
      await searchUsers() // 重新載入使用者列表
    } catch (error) {
      console.error('更新使用者權限失敗:', error)
      alert(
        error instanceof Error ? error.message : '操作失敗，請稍後再試'
      )
    }
  }

  //* 切換使用者展開狀態
  const toggleUserExpand = (uid: string) => {
    setExpandedUsers((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(uid)) {
        newSet.delete(uid)
      } else {
        newSet.add(uid)
      }
      return newSet
    })
  }

  //* 獲取身份顯示名稱
  const getRoleDisplayName = (role: UserProfile['role']): string => {
    switch (role) {
      case 'super_admin':
        return '超級管理員'
      case 'info_admin':
        return '資訊管理員'
      case 'club_officer':
        return '社團幹部'
      case 'user':
        return '一般使用者'
      default:
        return role
    }
  }

  //* 獲取權限顯示名稱
  const getPermissionDisplayName = (
    permission: keyof UserPermissions
  ): string => {
    const permissionNames: Record<keyof UserPermissions, string> = {
      unrestricted: '不受任何限制 (A)',
      manageAllPermissions: '管理所有帳號權限 (B)',
      manageAllPosts: '管理所有帳號個人貼文 (C)',
      managePermissions: '管理帳號權限 (D)',
      viewInternalPages: '查看社團內部頁面、資料 (E)',
      createPersonalPosts: '發表個人文章 (F)',
      createOfficialPosts: '發表社團官方文章 (G)',
    }
    return permissionNames[permission] || permission
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
                  (e.target.value as 'super_admin' | 'info_admin' | 'club_officer' | 'user') ||
                  undefined,
              })
            }
            className={styles.filter_select}
          >
            <option value="">所有角色</option>
            <option value="user">一般使用者</option>
            <option value="club_officer">社團幹部</option>
            <option value="info_admin">資訊管理員</option>
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
            {users.map((userItem) => {
              const isExpanded = expandedUsers.has(userItem.uid)
              const canManage = user ? canManageUserRole(user, userItem.role) : false

              return (
                <div key={userItem.uid} className={styles.user_card}>
                  <div className={styles.user_info}>
                    <Image
                      src={userItem.photoURL}
                      alt={userItem.displayName}
                      className={styles.user_avatar}
                      width={50}
                      height={50}
                    />
                    <div className={styles.user_details}>
                      <div className={styles.user_name_row}>
                        <h4>{userItem.displayName}</h4>
                        <span className={styles.user_role_badge}>
                          {getRoleDisplayName(userItem.role)}
                        </span>
                      </div>
                      <p>@{userItem.username}</p>
                      {userItem.bio && (
                        <p className={styles.user_bio}>{userItem.bio}</p>
                      )}
                      <div className={styles.user_status}>
                        {userItem.isVerified && (
                          <span className={styles.verified_badge}>已驗證</span>
                        )}
                        {!userItem.isActive && (
                          <span className={styles.inactive_badge}>已停用</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 展開/收合按鈕 */}
                  <button
                    onClick={() => toggleUserExpand(userItem.uid)}
                    className={styles.expand_button}
                  >
                    {isExpanded ? '收起' : '展開'}
                  </button>

                  {/* 展開的權限詳細資訊 */}
                  {isExpanded && (
                    <div className={styles.user_permissions}>
                      <h5>權限設定</h5>
                      
                      {/* 身份選擇 */}
                      <div className={styles.role_select}>
                        <label>身份：</label>
                        <select
                          value={userItem.role}
                          onChange={(e) =>
                            handleUpdateRole(
                              userItem.uid,
                              e.target.value as UserProfile['role']
                            )
                          }
                          disabled={!canManage || userItem.role === 'super_admin'}
                          className={styles.role_select_input}
                        >
                          <option value="user">一般使用者</option>
                          <option value="club_officer">社團幹部</option>
                          <option value="info_admin">資訊管理員</option>
                          <option value="super_admin">超級管理員</option>
                        </select>
                      </div>

                      {/* 權限列表 */}
                      <div className={styles.permissions_list}>
                        <label>權限：</label>
                        {(Object.keys(userItem.permissions) as Array<
                          keyof UserPermissions
                        >).map((permission) => (
                          <label
                            key={permission}
                            className={styles.permission_item}
                          >
                            <input
                              type="checkbox"
                              checked={userItem.permissions[permission]}
                              onChange={(e) =>
                                handleUpdatePermission(
                                  userItem.uid,
                                  permission,
                                  e.target.checked
                                )
                              }
                              disabled={
                                !canManage ||
                                userItem.role === 'super_admin'
                              }
                            />
                            <span>
                              {getPermissionDisplayName(permission)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.user_actions}>
                    <button
                      onClick={() => handleVerifyAccount(userItem.uid)}
                      className={styles.verify_button}
                      disabled={userItem.isVerified || !canManage}
                    >
                      {userItem.isVerified ? '已驗證' : '驗證'}
                    </button>

                    <button
                      onClick={() => handleToggleAccount(userItem.uid, true)}
                      className={styles.activate_button}
                      disabled={userItem.isActive || !canManage}
                    >
                      啟用
                    </button>

                    <button
                      onClick={() => handleToggleAccount(userItem.uid, false)}
                      className={styles.deactivate_button}
                      disabled={!userItem.isActive || !canManage}
                    >
                      停用
                    </button>

                    {isSuperAdmin && canManage && (
                      <button
                        onClick={() => handleDeleteUser(userItem.uid)}
                        className={styles.delete_button}
                        disabled={userItem.role === 'super_admin'}
                      >
                        刪除
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
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
