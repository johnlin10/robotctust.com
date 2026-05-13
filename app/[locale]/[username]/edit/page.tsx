import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'

// util
import { createClient } from '@/app/utils/supabase/server'

// component
import EditProfileClient from './EditProfileClient'

export const metadata: Metadata = {
  title: '編輯個人資料｜中臺機器人研究社',
}

/**
 * [Page] 編輯個人資料頁面
 * @param params
 * @returns JSX.Element
 */
export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  // 獲取使用者名稱
  const { username: rawUsername } = await params
  const decodedUsername = decodeURIComponent(rawUsername)

  // 檢查使用者名稱是否合法
  if (!decodedUsername.startsWith('@')) {
    notFound()
  }

  // 獲取使用者名稱
  const urlUsername = decodedUsername.slice(1)

  // 建立 Supabase Client
  const supabase = await createClient()

  // 確認目前登入狀態
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  // 如果使用者未登入，則重定向到登入頁面
  if (!authUser) {
    redirect(`/login`)
  }

  // 取得登入使用者的資料
  const { data: userRow } = await supabase
    .from('users')
    .select(
      'username, display_name, bio, is_public, avatar_url, background_url, school_identity, club_identity, student_id',
    )
    .eq('id', authUser.id)
    .single()

  // 如果使用者資料不存在，則重定向到登入頁面
  if (!userRow) {
    redirect(`/login`)
  }

  // 如果使用者名稱不匹配，則重定向到使用者資訊頁面
  if (userRow.username !== urlUsername) {
    redirect(`/@${userRow.username}`)
  }

  return (
    <EditProfileClient
      uid={authUser.id}
      initialData={{
        username: userRow.username,
        displayName: userRow.display_name,
        bio: userRow.bio ?? '',
        isPublic: userRow.is_public ?? true,
        photoURL: userRow.avatar_url ?? '/assets/image/userEmptyAvatar.png',
        backgroundURL: userRow.background_url || null,
        schoolIdentity: userRow.school_identity || 'external',
        clubIdentity: userRow.club_identity || 'non_member',
        studentId: userRow.student_id || '',
      }}
    />
  )
}
