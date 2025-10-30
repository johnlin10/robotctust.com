import Link from 'next/link'
import styles from './ClubOfficer.module.scss'
import Image from 'next/image'
// utils
import { getUserProfileByUsernameServer } from '@/app/utils/userService'

interface ClubOfficer {
  name: string
  position: string
  description: string
  username: string
}

/**
 * 社團幹部項目元件
 */
async function ClubOfficerItem({ clubOfficer }: { clubOfficer: ClubOfficer }) {
  //* 取得使用者頭像
  let avatarUrl = '/assets/image/userEmptyAvatar.png' // 預設頭像

  if (clubOfficer.username) {
    try {
      const userProfile = await getUserProfileByUsernameServer(
        clubOfficer.username
      )
      if (userProfile?.photoURL) {
        avatarUrl = userProfile.photoURL
      } else {
        console.log(userProfile)
      }
    } catch (error) {
      console.error('獲取使用者頭像時發生錯誤:', error)
    }
  }

  const ClubOfficerItemLink = ({ children }: { children: React.ReactNode }) => {
    if (clubOfficer.username) {
      return (
        <Link
          href={`/user/${clubOfficer.username}`}
          className={`${styles.clubOfficerItem} ${styles.clubOfficerItemLink}`}
        >
          {children}
        </Link>
      )
    } else {
      return <div className={styles.clubOfficerItem}>{children}</div>
    }
  }

  return (
    <ClubOfficerItemLink>
      <div className={styles.clubOfficerItemImage}>
        <Image
          src={avatarUrl}
          alt={`${clubOfficer.name} 的頭像`}
          height={240}
          width={240}
        />
      </div>
      <div className={styles.clubOfficerInfo}>
        <div className={styles.clubOfficerItemName}>
          <h1>{clubOfficer.name}</h1>
        </div>
        <div className={styles.clubOfficerItemPosition}>
          <p>{clubOfficer.position}</p>
        </div>
      </div>
    </ClubOfficerItemLink>
  )
}

/**
 * 社團幹部列表
 */
export default function ClubOfficer() {
  const clubOfficers: ClubOfficer[] = [
    {
      name: '藍世錡',
      position: '社長',
      description: '社長',
      username: '',
    },
    {
      name: '趙泰齡',
      position: '副社長',
      description: '副社長',
      username: 'fdsect',
    },
    {
      name: '王朝育',
      position: '活動',
      description: '活動',
      username: 'wangchaoyu555',
    },
    {
      name: '林廷亘',
      position: '總務',
      description: '總務',
      username: '',
    },
    {
      name: '陳宜均',
      position: '財務',
      description: '財務',
      username: '',
    },
    {
      name: '林昌龍',
      position: '美工',
      description: '美工',
      username: 'johnlin',
    },
  ]
  return (
    <div className={styles.clubOfficer}>
      <h2>社團幹部</h2>
      <div className={styles.clubOfficerList}>
        {clubOfficers.map((clubOfficer) => (
          <ClubOfficerItem key={clubOfficer.name} clubOfficer={clubOfficer} />
        ))}
      </div>
    </div>
  )
}
