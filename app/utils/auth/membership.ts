import { createClient } from '@/app/utils/supabase/server'

/**
 * 檢查當前登入使用者是否為學期社員
 * @returns {Promise<boolean>} 是否為社員
 */
export async function isUserSemesterMember(): Promise<boolean> {
  const supabase = await createClient()

  // 1. 獲取當前使用者
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return false

  // 2. 從 users 資料表獲取使用者的 student_id
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('student_id')
    .eq('id', user.id)
    .maybeSingle()

  if (userError || !userData?.student_id) return false

  // 3. 檢查 student_id 是否存在於 semester_members 資料表
  const { data: memberData, error: memberError } = await supabase
    .from('semester_members')
    .select('id')
    .eq('student_id', userData.student_id)
    .limit(1)
    .maybeSingle()

  if (memberError || !memberData) return false

  return true
}
