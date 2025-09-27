import { Metadata } from 'next'

//* 網站基本資訊常數
const SITE_CONFIG = {
  name: '中臺機器人研究社',
  shortName: '中臺機器人研究社',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://robot-ctust.vercel.app',
  locale: 'zh-TW',
  creator: '中臺機器人研究社',
  publisher: '中臺機器人研究社',
  keywords: [
    '機器人',
    '中臺科技大學',
    '研究社',
    '機器人技術',
    '學習平台',
    'CTUST',
    'Robot',
    'Research Club',
  ],
} as const

//* metadata 函數選項介面
export interface MetadataOptions {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  authors?: Array<{ name: string; url?: string }>
  category?: string
  noIndex?: boolean
}

/**
 * 生成完整的頁面 metadata
 * @param options - metadata 選項物件
 * @returns 完整的 Next.js Metadata 物件
 *
 * @example
 * ```tsx
 * export async function generateMetadata() {
 *   return metadata({
 *     title: '關於｜中臺機器人研究社',
 *     description: '了解中臺機器人研究社的成立宗旨與活動內容',
 *     keywords: ['關於我們', '社團介紹'],
 *     category: 'about'
 *   })
 * }
 * ```
 */
export function metadata(options: MetadataOptions): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = '/assets/icons/web-icon/robotctust-web-icon-1024.png',
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    authors,
    category,
    noIndex = false,
  } = options

  const fullUrl = url ? `${SITE_CONFIG.url}${url}` : SITE_CONFIG.url
  const imageUrl = image.startsWith('http')
    ? image
    : `${SITE_CONFIG.url}${image}`
  const allKeywords = [...SITE_CONFIG.keywords, ...keywords]

  return {
    //* 基本頁面資訊
    title,
    description,
    applicationName: SITE_CONFIG.name,

    //* SEO 相關
    keywords: allKeywords,
    authors: authors || [{ name: SITE_CONFIG.creator }],
    creator: SITE_CONFIG.creator,
    publisher: SITE_CONFIG.publisher,
    generator: 'Next.js',
    category,

    //* 搜尋引擎設定
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },

    //* 網站驗證 (可依需求添加)
    verification: {
      // google: 'your-google-verification-code',
      // yandex: 'your-yandex-verification-code',
    },

    //* 規範化 URL 和替代語言
    alternates: {
      canonical: fullUrl,
      languages: {
        'zh-TW': fullUrl,
        'x-default': fullUrl,
      },
    },

    //* Open Graph metadata
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      type,
      images: [
        {
          url: imageUrl,
          width: 1024,
          height: 1024,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authors && { authors: authors.map((author) => author.name) }),
    },

    //* Twitter metadata
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@robotctust', // 可依實際 Twitter 帳號調整
      site: '@robotctust',
    },

    //* 其他 metadata
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },

    //* Apple Web App 設定
    appleWebApp: {
      capable: true,
      title: SITE_CONFIG.shortName,
      statusBarStyle: 'default',
    },

    //* 其他自訂 metadata
    other: {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
    },
  }
}

/**
 * 將 CompetitionDateTime 轉換為 ISO 8601 格式
 * @param dateTime - CompetitionDateTime 物件
 * @returns ISO 8601 格式的日期時間字串，或 undefined
 */
export function formatDateTimeToISO(dateTime?: {
  date: string | null
  time: string | null
}): string | undefined {
  if (!dateTime?.date) return undefined

  const timeStr = dateTime.time || '00:00'
  const isoString = `${dateTime.date}T${timeStr}:00+08:00`

  // 驗證格式是否正確
  try {
    new Date(isoString)
    return isoString
  } catch {
    return undefined
  }
}

/**
 * 將 Firebase Timestamp 轉換為 ISO 8601 格式
 * @param timestamp - Firebase Timestamp 物件
 * @returns ISO 8601 格式的日期時間字串，或 undefined
 */
export function formatFirebaseTimestampToISO(timestamp?: {
  toDate?: () => Date
}): string | undefined {
  if (!timestamp?.toDate) return undefined

  try {
    return timestamp.toDate().toISOString()
  } catch {
    return undefined
  }
}

/**
 * 從 Markdown 內容生成 SEO 友善的描述
 * @param markdown - Markdown 格式的內容
 * @param maxLength - 最大長度，預設 160 字元
 * @returns 清理過的描述文字
 */
export function generateDescriptionFromMarkdown(
  markdown: string,
  maxLength: number = 160
): string {
  if (!markdown) return ''

  return (
    markdown
      .replace(/#{1,6}\s+/g, '') // 移除標題
      .replace(/\*\*(.+?)\*\*/g, '$1') // 移除粗體
      .replace(/\*(.+?)\*/g, '$1') // 移除斜體
      .replace(/`(.+?)`/g, '$1') // 移除行內程式碼
      .replace(/```[\s\S]*?```/g, '') // 移除程式碼區塊
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // 移除連結，保留文字
      .replace(/!\[.*?\]\(.+?\)/g, '') // 移除圖片
      .replace(/^\s*[-*+]\s+/gm, '') // 移除清單符號
      .replace(/^\s*\d+\.\s+/gm, '') // 移除有序清單
      .replace(/^\s*>\s+/gm, '') // 移除引用
      .replace(/---+/g, '') // 移除分隔線
      .replace(/\n+/g, ' ') // 將換行替換為空格
      .replace(/\s+/g, ' ') // 合併多個空格
      .trim()
      .substring(0, maxLength) + (markdown.length > maxLength ? '...' : '')
  )
}

/**
 * 簡化版 metadata 函數 (向後相容)
 * @param title - 頁面標題
 * @param description - 頁面描述
 * @returns 基本的 metadata 物件
 * @deprecated 建議使用完整版的 metadata 函數
 */
export function basicMetadata(title: string, description: string): Metadata {
  return metadata({ title, description })
}
