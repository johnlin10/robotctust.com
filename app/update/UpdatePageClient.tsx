'use client'

import React, { useState, useEffect, useContext } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import styles from './update.module.scss'
// components
import CreatePostModal from '../components/CreatePostModal'
import Loading from '../components/Loading/Loading'
import FloatingActions from '../components/FloatingActions/FloatingActions'
// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faFileAlt, faTrash } from '@fortawesome/free-solid-svg-icons'
// contexts
import { AuthContext } from '../contexts/AuthContext'
import { useHeaderState } from '../contexts/HeaderContext'
// utils
import { useQueryState, parseAsString } from 'nuqs'
import {
  checkUserPermission,
  formatPostDate,
  deletePost,
  getAllPosts,
} from '../utils/postService'
// types
import {
  Post,
  PostCategory,
  POST_CATEGORY_LABELS,
  POST_CATEGORIES,
  POST_CATEGORY_COLORS,
  CategorySlug,
  CATEGORY_TO_SLUG,
  SLUG_TO_CATEGORY,
} from '../types/post'
import { deserializePost, SerializedPost } from '../types/serialized'

// 篩選類型
type FilterType = PostCategory | 'all'

interface UpdatePageClientProps {
  initialPosts: SerializedPost[]
}

/**
 * 最新資訊頁面客戶端
 */
export default function UpdatePageClient({
  initialPosts,
}: UpdatePageClientProps) {
  // 獲取登入資訊
  const authContext = useContext(AuthContext)
  const user = authContext?.user
  // 路由
  const router = useRouter()
  // 獲取 Header 狀態
  const { isCompactHeader } = useHeaderState()

  //* 狀態管理
  // 文章資料
  const [posts, setPosts] = useState<Post[]>(
    initialPosts.map(deserializePost) as Post[]
  )
  // 篩選後的文章資料
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  // 載入狀態
  const [loading, setLoading] = useState(true)
  // 錯誤訊息
  const [error, setError] = useState<string | null>(null)
  // 當前篩選類型
  const [categorySlug, setCategorySlug] = useQueryState(
    'category',
    parseAsString.withDefault('')
  )
  const currentFilter: FilterType = categorySlug
    ? SLUG_TO_CATEGORY[categorySlug as CategorySlug] || 'all'
    : 'all'
  // 是否可以發布文章
  const [canCreatePost, setCanCreatePost] = useState(false)
  // 是否顯示發布文章模態
  const [showCreateModal, setShowCreateModal] = useState(false)

  /**
   * 載入文章資料
   * @returns void
   */
  const loadPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      const postsData = await getAllPosts()
      setPosts(postsData)
      console.log('Posts loaded successfully:', postsData.length, 'posts')
    } catch (error) {
      console.error('Error loading posts:', error)
      setError(error instanceof Error ? error.message : '載入文章失敗')
    } finally {
      setLoading(false)
    }
  }

  // 初次載入文章
  useEffect(() => {
    setPosts(initialPosts.map(deserializePost) as Post[])
    setLoading(false)
  }, [initialPosts])

  // 檢查使用者權限
  useEffect(() => {
    const checkPermissions = async () => {
      if (user) {
        try {
          const hasPermission = await checkUserPermission(user)
          setCanCreatePost(hasPermission)
        } catch (error) {
          console.error('Error checking permissions:', error)
        }
      } else {
        setCanCreatePost(false)
      }
    }

    checkPermissions()
  }, [user])

  // 篩選文章
  useEffect(() => {
    if (currentFilter === 'all') {
      setFilteredPosts(posts)
    } else {
      const filtered = posts.filter((post) => post.category === currentFilter)
      setFilteredPosts(filtered)
    }
  }, [posts, currentFilter])

  //* 事件處理
  /**
   * 處理篩選變更
   * @param filter 篩選類型
   * @returns void
   */
  const handleFilterChange = (filter: FilterType) => {
    if (filter === 'all') {
      setCategorySlug(null)
    } else {
      const slug = CATEGORY_TO_SLUG[filter]
      setCategorySlug(slug)
    }
  }

  /**
   * 處理發布文章
   * @returns void
   */
  const handleCreatePost = () => {
    setShowCreateModal(true)
  }

  /**
   * 處理發布文章成功
   * @param postId 文章 ID
   * @returns void
   */
  const handleCreatePostSuccess = async (postId: string) => {
    console.log('Post created successfully:', postId)
    router.refresh()
  }

  /**
   * 處理關閉發布文章模態
   * @returns void
   */
  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
  }

  /**
   * 處理點擊文章
   * @param postId 文章 ID
   * @returns void
   */
  const handlePostClick = (postId: string) => {
    router.push(`/update/${postId}`)
  }

  /**
   * 處理刪除文章
   * @param postId 文章 ID
   * @returns void
   */
  const handleDeletePost = async (postId: string) => {
    if (!user) {
      alert('請先登入')
      return
    }

    const confirmDelete = window.confirm(
      '確定要刪除這篇文章嗎？此操作無法復原。'
    )
    if (!confirmDelete) {
      return
    }

    try {
      setLoading(true)
      await deletePost(user, postId)
      // 從狀態中移除已刪除的文章
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId))
      alert('文章刪除成功')
    } catch (error) {
      console.error('Error deleting post:', error)
      const errorMessage =
        error instanceof Error ? error.message : '刪除失敗，請稍後再試'
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  //* 渲染
  /**
   * 渲染文章卡片
   * @param post 文章
   * @returns PostCard 元件
   */
  const renderPostCard = (post: Post) => {
    /**
     * 提取文章摘要（去除 Markdown 語法）
     * @param markdown 文章內容
     * @param maxLength 最大長度
     * @returns 文章摘要
     */
    const getPostExcerpt = (markdown: string, maxLength: number = 150) => {
      // 簡單的 Markdown 清理
      const plainText = markdown
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

      return plainText.length > maxLength
        ? plainText.substring(0, maxLength) + '...'
        : plainText
    }

    return (
      <Link
        key={post.id}
        className={styles.postCard}
        href={`/update/${post.id}`}
        role="link"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handlePostClick(post.id)
          }
        }}
      >
        <div className={styles.postCardContent}>
          <div className={styles.postCoverContainer}>
            {post.coverImageUrl && (
              <Image
                src={post.coverImageUrl}
                alt={post.title}
                className={styles.postCover}
                width={120}
                height={90}
                priority
              />
            )}
          </div>
          <div className={styles.mainContent}>
            <div className={styles.postHeader}>
              <div className={styles.postMeta}>
                <div className={styles.postInfo}>
                  <span
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
                    {POST_CATEGORY_LABELS[post.category]}
                  </span>
                  <span className={styles.postAuthor}>
                    {post.authorDisplayName}
                  </span>
                  <span className={styles.postDate}>
                    {formatPostDate(post.createdAt)}
                  </span>
                </div>
                <h3 className={styles.postTitle}>{post.title}</h3>
              </div>
            </div>
            <div className={styles.postContentContainer}>
              {post.coverImageUrl && (
                <Image
                  src={post.coverImageUrl}
                  alt={post.title}
                  className={styles.postCover}
                  width={120}
                  height={90}
                  priority
                />
              )}
              {post.contentMarkdown && (
                <div className={styles.postContent}>
                  {getPostExcerpt(post.contentMarkdown)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 只有有權限的使用者才能看到刪除按鈕 */}
        {canCreatePost && (
          <div className={styles.postCardActions}>
            <button
              className={styles.deleteButton}
              onClick={(e) => {
                // 阻擋事件氣泡
                e.preventDefault()
                e.stopPropagation()
                handleDeletePost(post.id)
              }}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faTrash} />
              <span>刪除</span>
            </button>
          </div>
        )}
      </Link>
    )
  }

  /**
   * 渲染內容
   * @returns 內容元件
   */
  const renderContent = () => {
    // 載入中
    if (loading) {
      return <Loading text="正在載入文章" />
    }

    // 錯誤
    if (error) {
      return (
        <div className={styles.errorState}>
          <p>載入文章時發生錯誤：{error}</p>
          <button className={styles.retryButton} onClick={() => loadPosts()}>
            重新載入
          </button>
        </div>
      )
    }

    // 無資料
    if (filteredPosts.length === 0) {
      return (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faFileAlt} className={styles.emptyIcon} />
          <p>
            {currentFilter === 'all'
              ? '目前沒有任何文章'
              : `目前沒有「${POST_CATEGORY_LABELS[currentFilter]}」分類的文章`}
          </p>
        </div>
      )
    }

    return (
      <div className={styles.postsContainer}>
        {filteredPosts.map(renderPostCard)}
      </div>
    )
  }

  /**
   * 渲染頁面
   * @returns 頁面元件
   */
  return (
    <>
      <div className={styles.updateContent}>
        {/* 篩選 */}
        <div
          className={`${styles.filterSection} ${
            isCompactHeader ? styles.headerCompact : ''
          }`}
        >
          <div className={styles.filterButtons}>
            <button
              onClick={() => handleFilterChange('all')}
              className={`${styles.filterButton} ${
                currentFilter === 'all' ? styles.active : ''
              }`}
            >
              {POST_CATEGORY_LABELS.all}
            </button>
            {POST_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleFilterChange(category)}
                className={`${styles.filterButton} ${
                  currentFilter === category ? styles.active : ''
                }`}
                data-category={category}
                style={
                  {
                    '--category-bg-color':
                      POST_CATEGORY_COLORS[category].background,
                    '--category-text-color':
                      POST_CATEGORY_COLORS[category].text,
                    '--category-border-color':
                      POST_CATEGORY_COLORS[category].border,
                  } as React.CSSProperties
                }
              >
                {POST_CATEGORY_LABELS[category]}
              </button>
            ))}
          </div>
        </div>

        {/* 文章列表 */}
        {renderContent()}
      </div>
      {/* 發布文章模態 */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        onSuccess={handleCreatePostSuccess}
      />

      {/* 只有有權限的使用者才能看到發布文章按鈕 */}
      {canCreatePost && (
        // <div className={styles.actions}>
        //   <button onClick={handleCreatePost} className={styles.createButton}>
        //     <FontAwesomeIcon icon={faPlus} />
        //     <span>發布文章</span>
        //   </button>
        // </div>

        <FloatingActions
          align="right"
          actions={[
            {
              icon: faPlus,
              label: '發布文章',
              labelVisible: true,
              variant: 'primary',
              onClick: handleCreatePost,
            },
          ]}
        />
      )}
    </>
  )
}
