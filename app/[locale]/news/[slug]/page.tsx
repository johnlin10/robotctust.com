import { Metadata } from 'next'
import styles from './post-detail.module.scss'

// utils
import {
  metadata,
  formatFirebaseTimestampToISO,
  generateDescriptionFromMarkdown,
} from '@/app/utils/metadata'
import { getAllPosts, getPostById } from '@/app/utils/postService'
import { getTranslations } from 'next-intl/server'

// components
import Page from '@/app/components/page/Page'
import NewsDetailClient from './NewsDetailClient'

// types
import { Post } from '@/app/types/post'
import { CATEGORY_TO_SLUG } from '@/app/types/post'
import { serializePost } from '@/app/types/serialized'

// 重新整理時間
export const revalidate = 60

// 動態參數
export const dynamicParams = true

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post: Post) => ({
    slug: post.id,
  }))
}

/**
 * Server Component - 預載文章資料並處理 SEO metadata
 */
export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  let initialPost = null
  let error = null

  try {
    const post = await getPostById(slug)
    if (post) {
      initialPost = serializePost(post)
    } else {
      const t = await getTranslations('News')
      error = t('detail.error.notFound')
    }
  } catch (err) {
    console.error('載入文章失敗：', err)
    const t = await getTranslations('News')
    error = t('detail.error.loadFailed')
  }

  return (
    <Page style={styles.postDetailContainer}>
      <NewsDetailClient initialPost={initialPost} initialError={error} />
    </Page>
  )
}

/**
 * 生成頁面 metadata
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const t = await getTranslations('News')

  try {
    const { slug } = await params
    const post = await getPostById(slug)

    if (!post) {
      return metadata({
        title: t('detail.meta.notFound.title'),
        description: t('detail.meta.notFound.description'),
        keywords: t('detail.meta.notFound.keywords').split(','),
        url: `/news/${slug}`,
        noIndex: true,
      })
    }

    const categoryLabel = t(
      `categories.${CATEGORY_TO_SLUG[post.category]}`,
    )

    return metadata({
      title: t('detail.meta.titleTemplate', {
        title: post.title,
        category: categoryLabel,
      }),
      description:
        generateDescriptionFromMarkdown(post.contentMarkdown, 160) ||
        t('detail.meta.descriptionTemplate', {
          title: post.title,
          author: post.authorDisplayName,
        }),
      keywords: [
        categoryLabel,
        ...post.title.split(/\s+/).slice(0, 3),
      ],
      image: post.coverImageUrl || undefined,
      url: `/news/${slug}`,
      type: 'article',
      publishedTime: formatFirebaseTimestampToISO(post.createdAt),
      modifiedTime: formatFirebaseTimestampToISO(post.updatedAt),
      authors: [{ name: post.authorDisplayName }],
      category: categoryLabel,
    })
  } catch (error) {
    console.error('Error generating metadata:', error)

    return metadata({
      title: t('detail.meta.loading.title'),
      description: t('detail.meta.loading.description'),
      keywords: t('detail.meta.loading.keywords').split(','),
      url: `/news/${await params.then((p) => p.slug)}`,
      noIndex: true,
    })
  }
}
