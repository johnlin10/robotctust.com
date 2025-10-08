'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faCalendar,
  faUser,
  faTag,
  faSpinner,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons'
import styles from './post-detail.module.scss'
import MarkdownRenderer from '../../components/Markdown/MarkdownRenderer'
import { formatPostDate } from '../../utils/postService'
import { POST_CATEGORY_LABELS } from '../../types/post'
import { SerializedPost, deserializePost } from '../../types/serialized'
import Image from 'next/image'

interface PostDetailClientProps {
  postId: string
  initialPost: SerializedPost | null
  initialError: string | null
}

export default function PostDetailClient({
  initialPost,
  initialError,
}: PostDetailClientProps) {
  const router = useRouter()

  // 使用預載的資料初始化狀態
  const post = initialPost ? deserializePost(initialPost) : null
  const loading = false // server 已預載，不需要載入狀態
  const error = initialError

  const handleGoBack = () => {
    router.back()
  }

  const handleGoToList = () => {
    router.push('/update')
  }

  // 載入中狀態
  if (loading) {
    return (
      <div className={styles.postDetailContent}>
        <div className={styles.loadingState}>
          <FontAwesomeIcon icon={faSpinner} className={styles.spinner} spin />
          <span>載入中...</span>
        </div>
      </div>
    )
  }

  // 錯誤狀態
  if (error || !post) {
    return (
      <div className={styles.postDetailContent}>
        <div className={styles.errorState}>
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className={styles.errorIcon}
          />
          <h2>載入失敗</h2>
          <p>{error || '文章不存在'}</p>
          <div className={styles.errorActions}>
            <button onClick={handleGoBack} className={styles.backButton}>
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>返回上頁</span>
            </button>
            <button onClick={handleGoToList} className={styles.listButton}>
              <span>回到文章列表</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.postDetailContent}>
      {/* Post Content */}
      <article className={styles.article}>
        {/* Post Title Area */}
        <header className={styles.articleHeader}>
          {/* Post Category */}
          <div className={styles.categoryBadge}>
            <FontAwesomeIcon icon={faTag} />
            <span>{POST_CATEGORY_LABELS[post.category]}</span>
          </div>

          {/* Post Title */}
          <h1 className={styles.title}>{post.title}</h1>

          {/* Post Metadata */}
          <div className={styles.metadata}>
            <div className={styles.metaItem}>
              <FontAwesomeIcon icon={faUser} />
              <span>{post.authorDisplayName}</span>
            </div>
            <div className={styles.metaItem}>
              <FontAwesomeIcon icon={faCalendar} />
              <span>{formatPostDate(post.createdAt)}</span>
            </div>
            {post.updatedAt &&
              post.updatedAt.seconds !== post.createdAt.seconds && (
                <div className={styles.metaItem}>
                  <span className={styles.updated}>
                    (更新於 {formatPostDate(post.updatedAt)})
                  </span>
                </div>
              )}
          </div>
        </header>

        {/* Post Cover Image */}
        {post.coverImageUrl && (
          <div className={styles.coverImageContainer}>
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              className={styles.coverImage}
              width={1200}
              height={800}
              quality={85}
              priority
            />
          </div>
        )}

        {/* Post Content */}
        <div className={styles.content}>
          <MarkdownRenderer content={post.contentMarkdown} />
        </div>
      </article>
    </div>
  )
}
