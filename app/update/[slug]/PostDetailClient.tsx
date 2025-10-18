'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendar,
  faUser,
  faExclamationTriangle,
  faCheck,
  faLink,
  faShare,
} from '@fortawesome/free-solid-svg-icons'
import styles from './post-detail.module.scss'
import MarkdownRenderer from '../../components/Markdown/MarkdownRenderer'
import { formatPostDate } from '../../utils/postService'
import { POST_CATEGORY_LABELS } from '../../types/post'
import { SerializedPost, deserializePost } from '../../types/serialized'
import Image from 'next/image'
import { POST_CATEGORY_COLORS } from '../../types/post'
import FloatingActionBar, {
  ActionItem,
} from '@/app/components/FloatingActionBar/FloatingActionBar'
import { faThreads, faXTwitter } from '@fortawesome/free-brands-svg-icons'
import useWebSupport from '@/app/hooks/useWebSupport'

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

  // 檢測瀏覽器功能支援
  const supportsShare = useWebSupport('share')

  // 使用預載的資料初始化狀態
  const post = initialPost ? deserializePost(initialPost) : null
  const postId = post?.id
  const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/update/${postId}`
  const error = initialError

  const handleGoToList = () => {
    router.push('/update')
  }

  const handleShareUrl = async () => {
    // 檢查是否支援 Clipboard API
    try {
      await navigator.clipboard.writeText(postUrl)
      return
    } catch (err) {
      console.warn('Clipboard API failed: ', err)
    }
  }

  // 使用系統控件分享
  const handleShareSystem = async () => {
    const url = `${process.env.NEXT_PUBLIC_SITE_URL}/update/${post?.id}`
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

    const shareData = {
      title: post?.title,
      text: text,
      url: url,
    }

    await navigator.share(shareData).catch((err) => {
      console.warn('Share API failed: ', err)
    })
  }

  //* 浮動操作列動作
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
