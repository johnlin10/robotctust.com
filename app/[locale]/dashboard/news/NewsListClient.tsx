'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEdit, faTrash, faNewspaper } from '@fortawesome/free-solid-svg-icons'
import { useToast } from '@/app/contexts/ToastContext'
import { Modal } from '@/app/[locale]/dashboard/components/Modal'
import { Skeleton } from '@/app/components/Skeleton'
import {
  POST_CATEGORIES,
  POST_CATEGORY_LABELS,
  POST_CATEGORY_COLORS,
  PostCategory,
} from '@/app/types/post'
import { SerializedPost } from '@/app/types/serialized'
import styles from './news.module.scss'

export default function NewsListClient() {
  const { showToast } = useToast()
  const [posts, setPosts] = useState<SerializedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<PostCategory | 'all'>('all')
  const [deleteTarget, setDeleteTarget] = useState<SerializedPost | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function loadPosts() {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/news')
      if (!res.ok) throw new Error('載入失敗')
      const data = await res.json()
      setPosts(data)
    } catch {
      showToast('載入文章列表時發生錯誤', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadPosts()
  }, [])

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchCategory = categoryFilter === 'all' || post.category === categoryFilter
      const matchSearch =
        !search ||
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.authorDisplayName.toLowerCase().includes(search.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [posts, categoryFilter, search])

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/dashboard/news/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '刪除失敗')
      }
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      showToast(`已刪除「${deleteTarget.title}」`, 'success')
      setDeleteTarget(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : '刪除失敗', 'error')
    } finally {
      setDeleting(false)
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>新聞管理</h1>
        <Link href="/dashboard/news/new" className="primary-button">
          <FontAwesomeIcon icon={faPlus} />
          <span>新建文章</span>
        </Link>
      </header>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="搜尋標題或作者..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as PostCategory | 'all')}
          className={styles.categorySelect}
        >
          <option value="all">所有分類</option>
          {POST_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {POST_CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Skeleton variant="table-row" count={6} />
      ) : filteredPosts.length === 0 ? (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faNewspaper} size="2x" style={{ marginBottom: 12 }} />
          <p>{search || categoryFilter !== 'all' ? '找不到符合條件的文章' : '目前還沒有任何文章'}</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>標題</th>
                <th>分類</th>
                <th>作者</th>
                <th>建立時間</th>
                <th>更新時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id}>
                  <td className={styles.titleCell}>
                    <Link href={`/dashboard/news/${post.id}`} className={styles.titleLink}>
                      {post.title}
                    </Link>
                  </td>
                  <td>
                    <span
                      className={styles.categoryBadge}
                      style={
                        {
                          '--category-bg-color': POST_CATEGORY_COLORS[post.category as PostCategory].background,
                          '--category-text-color': POST_CATEGORY_COLORS[post.category as PostCategory].text,
                          '--category-border-color': POST_CATEGORY_COLORS[post.category as PostCategory].border,
                        } as React.CSSProperties
                      }
                    >
                      {POST_CATEGORY_LABELS[post.category as PostCategory]}
                    </span>
                  </td>
                  <td>
                    {post.authorUsername ? (
                      <Link href={`/@${post.authorUsername}`} target="_blank">
                        {post.authorDisplayName}
                      </Link>
                    ) : (
                      post.authorDisplayName
                    )}
                  </td>
                  <td className={styles.dateCell}>{formatDate(post.createdAt)}</td>
                  <td className={styles.dateCell}>{formatDate(post.updatedAt)}</td>
                  <td className={styles.actionsCell}>
                    <div className={styles.actionButtons}>
                      <Link
                        href={`/dashboard/news/${post.id}`}
                        className="icon-button"
                        title="編輯文章"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Link>
                      <button
                        className="icon-button-danger"
                        title="刪除文章"
                        onClick={() => setDeleteTarget(post)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="確認刪除文章"
        maxWidth="480px"
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)} disabled={deleting}>
              取消
            </button>
            <button
              onClick={() => void confirmDelete()}
              disabled={deleting}
              data-danger="true"
            >
              {deleting ? '刪除中...' : '確認刪除'}
            </button>
          </>
        }
      >
        <p>
          你即將刪除 <strong>「{deleteTarget?.title}」</strong>，此操作無法復原，封面圖片也會一同刪除。
        </p>
      </Modal>
    </div>
  )
}
