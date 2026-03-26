'use client'

import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import UserManagement from '../../components/Admin/UserManagement'
import {
  runFullMigration,
  validateUserDataIntegrity,
  backupUserData,
} from '../../utils/migrationService'
import styles from './UserManagementPage.module.scss'
import Page from '@/app/components/page/Page'

/**
 * [Page] 使用者管理頁面
 * 提供管理員管理使用者和執行系統維護的介面
 */
export default function UserManagementPage() {
  const { user, isAdmin, isSuperAdmin } = useAuth()
  const [migrationStatus, setMigrationStatus] = useState<string>('')
  const [isRunningMigration, setIsRunningMigration] = useState(false)
  const [migrationResults, setMigrationResults] = useState<{
    backup: { success: boolean; backupId: string; userCount: number }
    validation: {
      totalUsers: number
      validUsers: number
      invalidUsers: string[]
    }
    migration: { success: number; failed: number; errors: string[] }
  } | null>(null)

  // 檢查權限
  if (!user) {
    return (
      <div className={styles.no_access}>
        <h1>請先登入</h1>
        <p>您需要登入才能存取此頁面</p>
      </div>
    )
  }

  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className={styles.no_access}>
        <h1>權限不足</h1>
        <p>您沒有權限存取使用者管理頁面</p>
      </div>
    )
  }

  //* 執行資料遷移
  const handleRunMigration = async () => {
    if (!isSuperAdmin) {
      alert('只有超級管理員可以執行資料遷移')
      return
    }

    if (
      !confirm(
        '確定要執行資料遷移嗎？這個操作會修改所有使用者的資料結構。建議先備份資料。'
      )
    ) {
      return
    }

    try {
      setIsRunningMigration(true)
      setMigrationStatus('正在執行資料遷移...')

      const results = await runFullMigration()
      setMigrationResults(results)
      setMigrationStatus('資料遷移完成！')
    } catch (error) {
      console.error('資料遷移失敗:', error)
      setMigrationStatus(`資料遷移失敗: ${(error as Error).message}`)
    } finally {
      setIsRunningMigration(false)
    }
  }

  //* 驗證資料完整性
  const handleValidateData = async () => {
    try {
      setMigrationStatus('正在驗證資料完整性...')

      const results = await validateUserDataIntegrity()

      setMigrationStatus(`
        驗證完成！
        總使用者數: ${results.totalUsers}
        有效使用者: ${results.validUsers}
        無效使用者: ${results.invalidUsers.length}
      `)

      if (results.invalidUsers.length > 0) {
        console.log('無效使用者:', results.invalidUsers)
        console.log('缺失欄位:', results.missingFields)
      }
    } catch (error) {
      console.error('驗證資料完整性失敗:', error)
      setMigrationStatus(`驗證失敗: ${(error as Error).message}`)
    }
  }

  //* 備份資料
  const handleBackupData = async () => {
    try {
      setMigrationStatus('正在備份使用者資料...')

      const result = await backupUserData()

      if (result.success) {
        setMigrationStatus(`
          備份完成！
          備份 ID: ${result.backupId}
          使用者數量: ${result.userCount}
        `)
      } else {
        setMigrationStatus(`備份失敗: ${result.error}`)
      }
    } catch (error) {
      console.error('備份資料失敗:', error)
      setMigrationStatus(`備份失敗: ${(error as Error).message}`)
    }
  }

  return (
    <Page
      style={styles.user_management_page}
      header={{
        title: '使用者管理',
        descriptions: ['管理系統使用者和執行維護操作'],
      }}
    >
      {/* 系統維護工具 */}
      {isSuperAdmin && (
        <div className={styles.maintenance_section}>
          <h2>系統維護工具</h2>
          <div className={styles.maintenance_tools}>
            <button
              onClick={handleBackupData}
              className={styles.backup_button}
              disabled={isRunningMigration}
            >
              備份使用者資料
            </button>

            <button
              onClick={handleValidateData}
              className={styles.validate_button}
              disabled={isRunningMigration}
            >
              驗證資料完整性
            </button>

            <button
              onClick={handleRunMigration}
              className={styles.migration_button}
              disabled={isRunningMigration}
            >
              {isRunningMigration ? '執行中...' : '執行資料遷移'}
            </button>
          </div>

          {migrationStatus && (
            <div className={styles.migration_status}>
              <h3>操作狀態</h3>
              <pre>{migrationStatus}</pre>
            </div>
          )}

          {migrationResults && (
            <div className={styles.migration_results}>
              <h3>遷移結果</h3>
              <div className={styles.results_grid}>
                <div className={styles.result_card}>
                  <h4>備份</h4>
                  <p>備份 ID: {migrationResults.backup.backupId}</p>
                  <p>使用者數量: {migrationResults.backup.userCount}</p>
                </div>

                <div className={styles.result_card}>
                  <h4>驗證</h4>
                  <p>總使用者: {migrationResults.validation.totalUsers}</p>
                  <p>有效使用者: {migrationResults.validation.validUsers}</p>
                  <p>
                    無效使用者:{' '}
                    {migrationResults.validation.invalidUsers.length}
                  </p>
                </div>

                <div className={styles.result_card}>
                  <h4>遷移</h4>
                  <p>成功: {migrationResults.migration.success}</p>
                  <p>失敗: {migrationResults.migration.failed}</p>
                  <p>錯誤數: {migrationResults.migration.errors.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 使用者管理介面 */}
      <div className={styles.user_management_section}>
        <UserManagement />
      </div>
    </Page>
  )
}
