import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faBook, faCheck, faCheckCircle, faCode, faHouse, faNewspaper, faTrophy, faUserGroup } from '@fortawesome/free-solid-svg-icons'

// 角色
export type Role =
  | 'super_admin'
  | 'admin'
  | 'admin_course'
  | 'admin_achievement'
  | 'admin_verifications'
  | 'admin_news'
  | 'admin_accounts'
  | 'admin_members'
  | 'member'

// 管理後台模組
export type DashboardModule =
  | 'courses' // 課程
  | 'achievements' // 成就
  | 'verifications' // 課程審核
  | 'news' // 最新消息管理
  | 'accounts' // 帳號管理
  | 'members' // 社員管理
  | 'programs' // 程式檔案庫

// 管理後台使用者
export interface DashboardActor {
  userId: string
  role: Role
  roles: Role[]
  modules: DashboardModule[]
}

// 管理後台模組配置
export interface DashboardModuleConfig {
  key: DashboardModule
  icon?: IconDefinition
  title: string
  description: string
  href: string
}

//* 模組權限對應表
export const MODULE_PERMISSIONS_MAP: Record<Role, DashboardModule[]> = {
  super_admin: ['courses', 'achievements', 'verifications', 'news', 'accounts', 'members', 'programs'],
  admin: ['courses', 'achievements', 'verifications', 'news', 'programs'],
  admin_course: ['courses', 'programs'],
  admin_achievement: ['achievements'],
  admin_verifications: ['verifications'],
  admin_news: ['news'],
  admin_accounts: ['accounts'],
  admin_members: ['members'],
  member: [],
}

//* 管理後台模組配置
export const DASHBOARD_MODULES: DashboardModuleConfig[] = [
  {
    key: 'news',
    icon: faNewspaper,
    title: '新聞',
    description: '發布、編輯與刪除最新資訊頁面的文章。',
    href: '/dashboard/news',
  },
  {
    key: 'courses',
    icon: faBook,
    title: '課程',
    description: '管理章節、單元與課程內容，並支援排序調整。',
    href: '/dashboard/courses',
  },
  {
    key: 'verifications',
    icon: faCheckCircle,
    title: '課程審核',
    description: '查看待審核清單並快速核准或退回。',
    href: '/dashboard/verifications',
  },
  {
    key: 'programs',
    icon: faCode,
    title: '程式檔案庫',
    description: '管理與編輯課程中使用的範例程式碼。',
    href: '/dashboard/programs',
  },
  {
    key: 'members',
    icon: faUserGroup,
    title: '社員管理',
    description: '社員名單、學期成員的管理。',
    href: '/dashboard/members',
  },
  {
    key: 'achievements',
    icon: faTrophy,
    title: '成就',
    description: '後續擴充成就圖鑑、門檻設定與發放策略。',
    href: '/dashboard/achievements',
  },
]
