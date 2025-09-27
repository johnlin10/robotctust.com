import React from 'react'
import styles from './update.module.scss'
// components
import Page from '../components/page/Page'
import UpdatePageClient from './UpdatePageClient'
// utils
import { metadata } from '../utils/metadata'
import { getAllPosts } from '../utils/postService'

export default async function UpdatePage() {
  return (
    <Page
      style={styles.updateContainer}
      header={{
        title: '最新資訊',
        descriptions: [
          '中臺機器人研究社的最新資訊，包含社團活動、技術分享、競賽資訊等內容。',
        ],
      }}
    >
      <UpdatePageClient />
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
    title: '最新資訊｜中臺機器人研究社',
    description,
    keywords: ['最新資訊', '社團動態', '技術分享', '活動公告'],
    url: '/update',
    category: 'news',
  })
}
