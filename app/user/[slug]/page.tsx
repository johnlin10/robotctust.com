import { Metadata } from 'next'
import { getUserProfileByUsernameServer } from '@/app/utils/userService'
import UserProfileClient from './UserProfileClient'
import styles from '../User.module.scss'

export default async function UserPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  //* 在服務器端獲取使用者資料
  const userProfile = await getUserProfileByUsernameServer(slug)

  return (
    <div className={`page ${styles.user_page}`}>
      <UserProfileClient slug={slug} initialUserProfile={userProfile} />
      <div className={`page-container ${styles.user_contents}`}>
        <p className={styles.feature_coming_soon}>更多社群功能，敬請期待！</p>
      </div>
    </div>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const userProfile = await getUserProfileByUsernameServer(slug)

  const title = userProfile
    ? `${userProfile.displayName} (@${userProfile.username})｜中臺機器人研究社`
    : `${slug}｜中臺機器人研究社`

  const description = userProfile
    ? `查看 ${userProfile.displayName} 在中臺機器人研究社的個人資料`
    : `查看使用者 ${slug} 的個人資料`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(userProfile?.photoURL && { images: [userProfile.photoURL] }),
    },
  }
}
