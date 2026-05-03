import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'
import { isUserOnboardingComplete } from '@/app/utils/auth/onboarding'

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
    .select('username, display_name, student_id, school_identity, club_identity')
    .eq('id', user.id)
    .maybeSingle()

  if (!profileError && !isUserOnboardingComplete(profile)) {
    redirect('/onboarding')
  }

  // 如果使用者資料存在，則重定向到使用者資訊頁面
  if (!profileError && profile?.username) {
    redirect(`/@${profile.username}`)
  } else {
    // 如果使用者資料不存在，則重定向到首頁
    redirect('/')
  }
}
