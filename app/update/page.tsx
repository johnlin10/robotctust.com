import { Suspense } from 'react'
import styles from './update.module.scss'

// utils
import { metadata } from '../utils/metadata'
import { getAllPosts } from '../utils/postService'
import { SerializedPost, serializePost } from '../types/serialized'

// components
import Page from '../components/page/Page'
import UpdatePageClient from './UpdatePageClient'
import Loading from '../components/Loading/Loading'

// 重新整理時間
export const revalidate = 60

/**
 * [Server Component] 最新資訊頁面
 */
export default async function UpdatePage() {
  let initialPosts: SerializedPost[] = []

  //* 載入文章資料
  try {
    const posts = await getAllPosts()
    initialPosts = posts.map(serializePost)
  } catch (error) {
    console.error('Error loading posts:', error)
    initialPosts = []
  }

  return (
    <Page
      style={styles.updateContainer}
      header={{
        title: '新聞',
        descriptions: [
          '中臺機器人研究社的最新資訊，包含社團活動、技術分享、競賽資訊等內容。',
        ],
      }}
    >
      <Suspense fallback={<Loading />}>
        <UpdatePageClient initialPosts={initialPosts} />
      </Suspense>
    </Page>
  )
}

//* Page Metadata
export async function generateMetadata() {
  let postsCount = 0

  //* 載入文章資料
  try {
    // 載入文章資料
    const posts = await getAllPosts()
    // 文章數量
    postsCount = posts.length
  } catch (error) {
    console.error('Error loading posts for metadata:', error)
  }

  //* 文章描述模板
  const description =
    postsCount > 0
      ? `中臺機器人研究社的最新資訊，共有 ${postsCount} 篇文章，包含社團活動、技術分享、競賽資訊等內容。`
      : '中臺機器人研究社的最新資訊，包含社團活動、技術分享、競賽資訊等內容。'

  return metadata({
    title: '新聞｜中臺機器人研究社',
    description,
    image: '/assets/image/metadata-backgrounds/update.webp',
    keywords: ['最新資訊', '社團動態', '技術分享', '活動公告', '新聞'],
    url: '/update',
    category: 'news',
  })
}
