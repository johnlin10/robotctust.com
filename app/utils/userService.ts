import { createClient as createBrowserClient } from './supabase/client'

/**
 * 檢查帳號名稱是否可用
 * @param username - 欲檢查的帳號名稱
 * @param excludeUid - 排除的使用者 ID（通常是目前使用者）
 * @returns {Promise<boolean>} 是否可用
 */
export const checkUsernameAvailable = async (
  username: string,
  excludeUid?: string,
): Promise<boolean> => {
  try {
    const supabase = createBrowserClient()
    let query = supabase.from('users').select('id').eq('username', username)

    if (excludeUid) {
      query = query.neq('id', excludeUid)
    }

    const { data, error } = await query.maybeSingle()
    if (error) throw error
    return !data
  } catch (error) {
    console.error('檢查帳號名稱可用性時發生錯誤:', error)
    return false
  }
}

/**
 * 檢查學號是否可用
 * @param studentId - 欲檢查的學號
 * @param excludeUid - 排除的使用者 ID（通常是目前使用者）
 * @returns {Promise<boolean>} 是否可用
 */
export const checkStudentIdAvailable = async (
  studentId: string,
  excludeUid?: string,
): Promise<boolean> => {
  try {
    const supabase = createBrowserClient()
    let query = supabase.from('users').select('id').eq('student_id', studentId)

    if (excludeUid) {
      query = query.neq('id', excludeUid)
    }

    const { data, error } = await query.maybeSingle()
    if (error) throw error
    return !data
  } catch (error) {
    console.error('檢查學號可用性時發生錯誤:', error)
    return false
  }
}
