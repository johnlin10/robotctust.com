/**
 * 課程驗證管理
 * @description 課程驗證管理，包括待審核的課程驗證項目的獲取、核准與退回
 * @author John Lin
 */

import { createAdminClient } from '@/app/utils/supabase/admin'

export interface PendingVerificationItem {
  /** 課程驗證項目 ID */
  id: string
  /** 課程驗證項目狀態 */
  status: 'pending' | 'approved' | 'rejected'
  /** 課程驗證項目建立時間 */
  created_at: string
  /** 課程驗證項目使用者 ID */
  user_id: string
  /** 課程驗證項目課程 ID */
  course_id: string
  /** 課程驗證項目使用者 */
  users: {
    /** 使用者學號 */
    student_id: string | null
    /** 使用者暱稱 */
    display_name: string | null
    /** 使用者帳號 */
    username: string | null
  } | null
  /** 課程驗證項目課程 */
  courses: {
    /** 課程 ID */
    id: string
    /** 課程名稱 */
    name: string
  } | null
}

/**
 * 獲取待審核的課程驗證項目
 * @returns 待審核的課程驗證項目
 */
export async function getPendingVerifications(): Promise<
  PendingVerificationItem[]
> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('course_verifications')
    .select(
      'id, status, created_at, user_id, course_id, users:users!course_verifications_user_id_fkey(student_id, display_name, username), courses(id, name)',
    )
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map((row) => {
    const user = Array.isArray(row.users) ? row.users[0] : row.users
    const course = Array.isArray(row.courses) ? row.courses[0] : row.courses

    return {
      id: row.id,
      status: row.status,
      created_at: row.created_at,
      user_id: row.user_id,
      course_id: row.course_id,
      users: user || null,
      courses: course || null,
    } as PendingVerificationItem
  })
}

/**
 * 核准課程驗證項目
 * @param verificationId - 課程驗證項目 ID
 * @param reviewerId - 核准者 ID
 * @returns 核准課程驗證項目的結果
 */
export async function approveVerification(
  verificationId: string,
  reviewerId: string,
): Promise<void> {
  // 建立管理員客戶端
  const admin = createAdminClient()
  // 核准課程驗證項目
  const { error } = await admin
    .from('course_verifications') // 課程驗證項目資料表
    .update({
      status: 'approved', // 更新為核准
      verified_by: reviewerId, // 更新為核准者 ID
      approved_at: new Date().toISOString(), // 更新為核准時間
    })
    .eq('id', verificationId) // 過濾課程驗證項目 ID
    .eq('status', 'pending') // 過濾狀態為待審核

  if (error) throw new Error(error.message)
}

/**
 * 退回課程驗證項目
 * @param verificationId - 課程驗證項目 ID
 * @param reviewerId - 退回者 ID
 * @returns 退回課程驗證項目的結果
 */
export async function rejectVerification(
  verificationId: string,
  reviewerId: string,
): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('course_verifications')
    .update({
      status: 'rejected',
      verified_by: reviewerId,
    })
    .eq('id', verificationId)
    .eq('status', 'pending')

  if (error) throw new Error(error.message)
}
