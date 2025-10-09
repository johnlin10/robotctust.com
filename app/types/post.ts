import { Timestamp } from 'firebase/firestore'

export type PostCategory =
  | '社團活動'
  | '即時消息'
  | '新聞分享'
  | '技術分享'
  | '競賽資訊'
  | '網站更新'

export interface Post {
  id: string // Document ID
  title: string
  contentMarkdown: string
  category: PostCategory
  coverImageUrl: string | null

  // 作者資訊 (Denormalized Data)
  authorId: string // Firebase Auth user.uid
  authorDisplayName: string // 儲存當下使用者的顯示名稱

  // 時間戳記
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface CreatePostData {
  title: string
  contentMarkdown: string
  category: PostCategory
  coverImageUrl?: string | null
}

export interface UpdatePostData {
  title?: string
  contentMarkdown?: string
  category?: PostCategory
  coverImageUrl?: string | null
}

// 權限管理
export interface AuthorizedUser {
  email: string
  active: boolean
}

export interface AccessControlDocument {
  authorizedUsers: AuthorizedUser[]
}

// 篩選選項
export interface PostFilter {
  category: PostCategory | 'all'
}

export const POST_CATEGORIES: PostCategory[] = [
  '社團活動',
  '即時消息',
  '新聞分享',
  '技術分享',
  '競賽資訊',
  '網站更新',
]

export const POST_CATEGORY_LABELS: Record<PostCategory | 'all', string> = {
  all: '全部',
  社團活動: '社團活動',
  即時消息: '即時消息',
  新聞分享: '新聞分享',
  技術分享: '技術分享',
  競賽資訊: '競賽資訊',
  網站更新: '網站更新',
}

/**
 * 文章分類顏色配置
 * 使用主題色彩變數以支援深淺色主題
 */
export const POST_CATEGORY_COLORS: Record<
  PostCategory,
  {
    background: string
    text: string
    border: string
  }
> = {
  社團活動: {
    background: 'var(--green-400)',
    text: 'var(--color-white)',
    border: 'var(--green-500)',
  },
  即時消息: {
    background: 'var(--red-400)',
    text: 'var(--color-white)',
    border: 'var(--red-500)',
  },
  新聞分享: {
    background: 'var(--orange-400)',
    text: 'var(--color-white)',
    border: 'var(--orange-500)',
  },
  技術分享: {
    background: 'var(--blue-400)',
    text: 'var(--color-white)',
    border: 'var(--blue-500)',
  },
  競賽資訊: {
    background: 'var(--purple-400)',
    text: 'var(--color-white)',
    border: 'var(--purple-500)',
  },
  網站更新: {
    background: 'var(--gray-400)',
    text: 'var(--color-white)',
    border: 'var(--gray-500)',
  },
}
