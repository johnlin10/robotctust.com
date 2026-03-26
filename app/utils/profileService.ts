import { createClient } from '@/app/utils/supabase/client'
import {
  UpdateUserProfileData,
  UserProfile,
} from '@/app/types/user'

/**
 * 安全更新目前登入使用者可編輯的個人資料欄位。
 */
export const updateUserProfileSafe = async (
  uid: string,
  updateData: UpdateUserProfileData,
  currentUserUid: string,
): Promise<void> => {
  if (uid !== currentUserUid) {
    throw new Error('沒有權限更新此使用者的資料')
  }

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (updateData.displayName !== undefined) {
    if (updateData.displayName.length > 15) {
      throw new Error('暱稱不能超過 15 個字元')
    }
    payload.display_name = updateData.displayName
  }

  if (updateData.bio !== undefined) {
    if (updateData.bio.length > 500) {
      throw new Error('個人簡介不能超過 500 個字元')
    }
    payload.bio = updateData.bio
  }

  if (updateData.location !== undefined) {
    if (updateData.location.length > 100) {
      throw new Error('所在地不能超過 100 個字元')
    }
    payload.location = updateData.location
  }

  if (updateData.website !== undefined) {
    if (updateData.website && !updateData.website.match(/^https?:\/\/.+/)) {
      throw new Error('網站 URL 格式不正確')
    }
    payload.website = updateData.website
  }

  if (updateData.socialLinks !== undefined) {
    payload.social_links = updateData.socialLinks as UserProfile['socialLinks']
  }

  if (updateData.privacy !== undefined) {
    payload.privacy = updateData.privacy as UserProfile['privacy']
  }

  const supabase = createClient()
  const { error } = await supabase.from('users').update(payload).eq('id', uid)

  if (error) {
    throw new Error(error.message)
  }
}
