import React from 'react'
import { Metadata } from 'next'
import styles from './post-detail.module.scss'
// components
import Page from '../../components/page/Page'
import PostDetailClient from './PostDetailClient'
// types
import { POST_CATEGORY_LABELS, Post } from '../../types/post'
import { serializePost } from '../../types/serialized'
// utils
import {
  metadata,
  formatFirebaseTimestampToISO,
  generateDescriptionFromMarkdown,
} from '../../utils/metadata'
import { getAllPosts, getPostById } from '../../utils/postService'

/**
 * 生成靜態參數
 * @returns 靜態參數
 */
export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post: Post) => ({
    slug: post.id,
  }))
}

/**
 * Server Component - 預載文章資料並處理 SEO metadata
 */
export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  let initialPost = null
  let error = null

  try {
    // 在 server side 預載文章資料
    const post = await getPostById(slug)
    if (post) {
      // 序列化資料以便傳遞給 client component
      initialPost = serializePost(post)
    } else {
      error = '文章不存在或已被刪除'
    }
  } catch (err) {
    console.error('Error loading post on server:', err)
    error = '載入文章失敗，請稍後再試'
  }

  return (
    <Page style={styles.postDetailContainer}>
      <PostDetailClient
        postId={slug}
        initialPost={initialPost}
        initialError={error}
      />
    </Page>
  )
}

/**
 * 生成頁面 metadata
 * 使用自訂的 metadata 組件提供完整的 SEO 支援
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  try {
    const { slug } = await params
    const post = await getPostById(slug)

    //* 文章不存在的情況
    if (!post) {
      return metadata({
        title: '文章不存在｜中臺機器人研究社',
        description: '您要查看的文章不存在或已被刪除，請檢查網址是否正確。',
        keywords: ['404', '文章不存在', '錯誤頁面'],
        url: `/update/${slug}`,
        noIndex: true, // 不被搜尋引擎索引
      })
    }

    //* 生成文章描述
    const description = generateDescriptionFromMarkdown(
      post.contentMarkdown,
      160
    )

    //* 生成關鍵字
    const categoryKeyword = POST_CATEGORY_LABELS[post.category]
    const keywords = [
      categoryKeyword,
      '中臺機器人研究社',
      '文章',
      '最新消息',
      ...post.title.split(/\s+/).slice(0, 3), // 從標題提取關鍵字
    ]

    return metadata({
      title: `${post.title}｜${categoryKeyword}｜中臺機器人研究社`,
      description:
        description ||
        `閱讀關於「${post.title}」的最新內容，由${post.authorDisplayName}分享。`,
      keywords,
      image: post.coverImageUrl || undefined,
      url: `/update/${slug}`,
      type: 'article',
      publishedTime: formatFirebaseTimestampToISO(post.createdAt),
      modifiedTime: formatFirebaseTimestampToISO(post.updatedAt),
      authors: [
        {
          name: post.authorDisplayName,
        },
      ],
      category: categoryKeyword,
    })
  } catch (error) {
    console.error('Error generating metadata:', error)

    //* 錯誤處理 - 提供基本的 metadata
    return metadata({
      title: '文章載入中｜中臺機器人研究社',
      description: '正在載入文章內容，請稍候...',
      keywords: ['載入中', '文章', '中臺機器人研究社'],
      url: `/update/${await params.then((p) => p.slug)}`,
      noIndex: true, // 載入錯誤時不被索引
    })
  }
}
