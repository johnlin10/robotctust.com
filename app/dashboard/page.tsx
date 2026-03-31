import Link from 'next/link'
// import styles from './page.module.scss'
import styles from './dashboard.module.scss'
import { getUserRoleName } from '@/app/types/user'

// components
// import { DashboardGlobalSidebar } from './components/DashboardGlobalSidebar'

// type
import { DASHBOARD_MODULES, DashboardModuleConfig } from '@/app/types/dashboard'

// util
import { requireDashboardAccess } from '@/app/utils/dashboard/auth'

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBookOpen,
  faCheckCircle,
  faNewspaper,
  faTrophy,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { getUserProfileByUidServer } from '../utils/userServiceServer'
import Image from 'next/image'

/**
 * [Component] 管理後台首頁
 * @returns 管理後台首頁
 */
export default async function DashboardHomePage() {
  // 獲取使用者資料
  const actor = await requireDashboardAccess()
  const userProfile = await getUserProfileByUidServer(actor.userId)
  // 獲取可見模組
  const visibleModules = DASHBOARD_MODULES.filter((module) =>
    actor.modules.includes(module.key),
  )

  const getModuleIcon = (module: DashboardModuleConfig) => {
    switch (module.key) {
      case 'courses':
        return (
          <FontAwesomeIcon className={styles.moduleIcon} icon={faBookOpen} />
        )
      case 'verifications':
        return (
          <FontAwesomeIcon className={styles.moduleIcon} icon={faCheckCircle} />
        )
      case 'achievements':
        return <FontAwesomeIcon className={styles.moduleIcon} icon={faTrophy} />
      case 'news':
        return (
          <FontAwesomeIcon className={styles.moduleIcon} icon={faNewspaper} />
        )
      case 'accounts':
        return <FontAwesomeIcon className={styles.moduleIcon} icon={faUsers} />
      default:
        return null
    }
  }

  return (
    <>
      {/* <DashboardGlobalSidebar role={actor.role} modules={actor.modules} /> */}
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <h1>控制台</h1>
            <p>管理網站的各項功能</p>
          </div>
          <div className={styles.userInfo}>
            <div className={`${styles.role} ${styles[actor.role]}`}>
              {getUserRoleName(actor.role)}
            </div>
            <div className={styles.userInfoContent}>
              <div className={styles.userInfoAvatar}>
                <Image
                  src={
                    userProfile?.photoURL || '/assets/image/userEmptyAvatar.png'
                  }
                  alt={userProfile?.displayName || ''}
                  width={40}
                  height={40}
                />
              </div>
              <div className={styles.userInfoName}>
                {userProfile?.displayName}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.modules}>
          <section className={styles.grid}>
            {visibleModules.map((module) => (
              <Link key={module.key} href={module.href} className={styles.card}>
                <div className={styles.header}>
                  {getModuleIcon(module)}
                  <h3>{module.title}</h3>
                </div>
                <p>{module.description}</p>
              </Link>
            ))}
          </section>
        </div>
      </div>
    </>
  )
}
