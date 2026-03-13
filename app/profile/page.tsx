import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'

/**
 * [Page] 重定向到使用者資訊頁面
 * @returns {void}
 */
export default async function ProfilePage() {
  // 建立 Supabase Client
  const supabase = await createClient()
  // 獲取使用者資料
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // 如果使用者未登入，則重定向到登入頁面
  if (authError || !user) {
    redirect('/login')
  }

  // 獲取使用者資料
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('username')
    .eq('id', user.id)
    .single()

  // 如果使用者資料存在，則重定向到使用者資訊頁面
  if (!profileError && profile?.username) {
    redirect(`/@${profile.username}`)
  } else {
    // 如果使用者資料不存在，則重定向到首頁
    redirect('/')
  }
}
