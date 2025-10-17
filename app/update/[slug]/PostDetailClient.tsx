'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendar,
  faUser,
  faExclamationTriangle,
  faCheck,
  faShare,
} from '@fortawesome/free-solid-svg-icons'
import styles from './post-detail.module.scss'
import MarkdownRenderer from '../../components/Markdown/MarkdownRenderer'
import { formatPostDate } from '../../utils/postService'
import { POST_CATEGORY_LABELS } from '../../types/post'
import { SerializedPost, deserializePost } from '../../types/serialized'
import Image from 'next/image'
import { POST_CATEGORY_COLORS } from '../../types/post'
import FloatingActions from '@/app/components/FloatingActions/FloatingActions'
// import { faThreads, faXTwitter } from '@fortawesome/free-brands-svg-icons'

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
  const error = initialError

  const handleGoToList = () => {
    router.push('/update')
  }

  const handleShareUrl = async () => {
    const url = window.location.href
    // 檢查是否支援 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(url)
        return
      } catch (err) {
        console.warn('Clipboard API failed: ', err)
      }
    }
  }

  //* 開發中
  // const handleShareToX = () => {
  //   const url = window.location.href
  //   window.open(`https://twitter.com/intent/tweet?text=${url}`, '_blank')
  // }

  // const handleShareToThreads = () => {
  //   const url = window.location.href
  //   window.open(
  //     `https://threads.net/intent/post?text=https://robotctust.com/update/wNaUXr4aL3I9QaYWd2gM`,
  //     '_blank'
  //   )
  // }

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
          <div
            className={styles.categoryBadge}
            data-category={post.category}
            style={
              {
                '--category-bg-color':
                  POST_CATEGORY_COLORS[post.category].background,
                '--category-text-color':
                  POST_CATEGORY_COLORS[post.category].text,
                '--category-border-color':
                  POST_CATEGORY_COLORS[post.category].border,
              } as React.CSSProperties
            }
          >
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

        {/* Share Buttons */}
        <FloatingActions
          align="right"
          actions={[
            // {
            //   icon: faThreads,
            //   label: '分享到 Threads',
            //   labelVisible: false,
            //   onClick: () => {
            //     handleShareToThreads()
            //   },
            // },
            // {
            //   icon: faXTwitter,
            //   label: '分享到 X',
            //   labelVisible: false,
            //   onClick: () => {
            //     handleShareToX()
            //   },
            // },
            {
              icon: faShare,
              label: '分享網址',
              labelVisible: true,
              onClick: () => {
                handleShareUrl()
              },
              clicked: {
                icon: faCheck,
                label: '已複製',
              },
            },
          ]}
        />
      </article>
    </div>
  )
}
