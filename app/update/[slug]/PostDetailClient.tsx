'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import styles from './post-detail.module.scss'

// components
import MarkdownRenderer from '../../components/Markdown/MarkdownRenderer'
import FloatingActionBar, {
  ActionItem,
} from '@/app/components/FloatingActionBar/FloatingActionBar'

// util
import { formatPostDate } from '../../utils/postService'

// hook
import useWebSupport from '@/app/hooks/useWebSupport'

// types
import { POST_CATEGORY_LABELS } from '../../types/post'
import { SerializedPost, deserializePost } from '../../types/serialized'
import { POST_CATEGORY_COLORS } from '../../types/post'

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendar,
  faUser,
  faExclamationTriangle,
  faCheck,
  faLink,
  faShare,
} from '@fortawesome/free-solid-svg-icons'
import { faThreads, faXTwitter } from '@fortawesome/free-brands-svg-icons'

interface PostDetailClientProps {
  postId: string // 文章 ID
  initialPost: SerializedPost | null // 初始化文章資料
  initialError: string | null // 初始化錯誤訊息
}

/**
 * [Client Component] 文章詳細頁面
 * @param initialPost - 初始化文章資料
 * @param initialError - 初始化錯誤訊息
 * @returns 文章詳細頁面
 */
export default function PostDetailClient({
  initialPost,
  initialError,
}: PostDetailClientProps) {
  const router = useRouter()

  // 檢測瀏覽器功能支援
  const supportsShare = useWebSupport('share')

  // 使用預載的資料初始化狀態
  const post = initialPost ? deserializePost(initialPost) : null
  const postId = post?.id
  const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/update/${postId}`
  const error = initialError

  /**
   * 跳轉到文章列表頁面
   * @returns void
   */
  const handleGoToList = () => {
    router.push('/update')
  }

  /**
   * 複製文章網址
   * @returns void
   */
  const handleShareUrl = async () => {
    // 檢查是否支援 Clipboard API
    try {
      await navigator.clipboard.writeText(postUrl)
      return
    } catch (err) {
      console.warn('Clipboard API failed: ', err)
    }
  }

  /**
   * 使用系統控件分享
   * @returns void
   */
  const handleShareSystem = async () => {
    // 生成分享網址
    const url = `${process.env.NEXT_PUBLIC_SITE_URL}/update/${post?.id}`
    // 生成分享文字
    const text =
      post?.contentMarkdown
        .replace(/#{1,6}\s+/g, '') // remove title
        .replace(/\*\*(.+?)\*\*/g, '$1') // remove bold
        .replace(/\*(.+?)\*/g, '$1') // remove italic
        .replace(/`(.+?)`/g, '$1') // remove inline code
        .replace(/\[(.+?)\]\(.+?\)/g, '$1') // remove link, keep text
        .replace(/!\[.*?\]\(.+?\)/g, '') // remove image
        .replace(/^\s*[-*+]\s+/gm, '') // remove list
        .replace(/^\s*\d+\.\s+/gm, '') // remove ordered list
        .replace(/^\s*>\s+/gm, '') // remove quote
        .replace(/---/g, '') // remove divider
        .trim()
        .substring(0, 100) + '...'

    // 生成分享資料
    const shareData = {
      title: post?.title,
      text: text,
      url: url,
    }

    // 使用系統控件分享
    await navigator.share(shareData).catch((err) => {
      console.warn('分享失敗：', err)
    })
  }

  /**
   * 浮動操作列動作
   * @returns ActionItem[]
   */
  const floatingActionBarActions: ActionItem[] = [
    {
      type: 'link',
      icon: faThreads,
      label: '分享到 Threads',
      labelVisible: false,
      href: `https://threads.net/intent/post?text=${postUrl}`,
      target: '_blank',
    },
    {
      type: 'link',
      icon: faXTwitter,
      label: '分享到 X',
      labelVisible: false,
      href: `https://twitter.com/intent/tweet?text=${postUrl}`,
      target: '_blank',
    },
    {
      type: 'button',
      icon: faLink,
      label: '複製網址',
      title: '複製文章網址',
      labelVisible: false,
      onClick: () => {
        handleShareUrl()
      },
      clicked: {
        icon: faCheck,
        label: '已複製',
      },
    },
    // 僅在支援 Web Share API 時顯示系統分享按鈕
    ...(supportsShare
      ? [
          {
            type: 'button' as const,
            icon: faShare,
            label: '分享',
            labelVisible: true,
            variant: 'primary' as const,
            onClick: handleShareSystem,
          },
        ]
      : []),
  ]

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
      </article>

      {/* Share Buttons */}
      <FloatingActionBar
        align="center"
        position="bottom"
        actions={floatingActionBarActions}
      />
    </div>
  )
}
