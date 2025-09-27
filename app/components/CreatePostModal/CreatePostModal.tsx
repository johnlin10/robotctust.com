'use client'

import React, { useState, useRef, useContext, useCallback } from 'react'
import Image from 'next/image'
import styles from './CreatePostModal.module.scss'
// components
import MarkdownEditor from '../Markdown/MarkdownEditor'
import HelpTooltip from '../HelpTooltip'
// context
import { AuthContext } from '../../contexts/AuthContext'
// util
import { createPost } from '../../utils/postService'
// types
import {
  PostCategory,
  POST_CATEGORIES,
  POST_CATEGORY_LABELS,
} from '../../types/post'
//icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faUpload, faTrash } from '@fortawesome/free-solid-svg-icons'

export interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (postId: string) => void
}

/**
 * [Component] 發布新文章模態視窗
 * @param isOpen 是否開啟
 * @param onClose 關閉模態視窗
 * @param onSuccess 發布成功後的回調函數
 * @returns
 */
const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // 使用者
  const context = useContext(AuthContext)
  const user = context?.user
  const [title, setTitle] = useState('')
  // 分類
  const [category, setCategory] = useState<PostCategory>('社團活動')
  // 內容
  const [content, setContent] = useState('')
  // 封面圖片
  const [coverImage, setCoverImage] = useState<File | null>(null)
  // 封面圖片預覽
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  )
  // 是否提交中
  const [isSubmitting, setIsSubmitting] = useState(false)
  // 是否拖拽中
  const [dragOver, setDragOver] = useState(false)
  // 文件輸入引用
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 使用 useCallback 穩定 onChange 回調函數引用
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent)
  }, [])

  /**
   * [Function] 重置表單
   * @returns void
   */
  const resetForm = () => {
    setTitle('')
    setCategory('社團活動')
    setContent('')
    setCoverImage(null)
    setCoverImagePreview(null)
    setIsSubmitting(false)
    setDragOver(false)
  }

  /**
   * [Function] 關閉模態視窗
   * @returns void
   */
  const handleClose = () => {
    if (isSubmitting) return
    resetForm()
    onClose()
  }

  /**
   * [Function] 選擇圖片
   * @param file 圖片檔案
   * @returns void
   */
  const handleImageSelect = (file: File) => {
    // 檢查檔案類型
    if (!file.type.startsWith('image/')) {
      alert('請選擇圖片檔案')
      return
    }

    // 檢查檔案大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('圖片檔案大小不能超過 5MB')
      return
    }

    setCoverImage(file)

    // 建立預覽
    const reader = new FileReader()
    reader.onload = (e) => {
      setCoverImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  /**
   * [Function] 處理文件輸入變化
   * @param e 事件
   * @returns void
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageSelect(file)
    }
  }

  /**
   * [Function] 處理拖拽覆蓋
   * @param e 事件
   * @returns void
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  /**
   * [Function] 處理拖拽離開
   * @param e 事件
   * @returns void
   */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  /**
   * [Function] 處理拖拽放下
   * @param e 事件
   * @returns void
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleImageSelect(files[0])
    }
  }

  /**
   * [Function] 處理移除圖片
   * @returns void
   */
  const handleRemoveImage = () => {
    setCoverImage(null)
    setCoverImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /**
   * [Function] 格式化文件大小
   * @param bytes 文件大小
   * @returns 格式化後的文件大小
   */
  const formatFileSize = (bytes: number): string => {
    // 如果文件大小為 0，則返回 0 Bytes
    if (bytes === 0) return '0 Bytes'
    // 文件大小單位
    const k = 1024
    // 文件大小單位
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    // 計算文件大小
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    // 返回格式化後的文件大小
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * [Function] 處理鍵盤按下
   * @param e 事件
   * @returns void
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Escape 鍵關閉模態視窗
    if (e.key === 'Escape' && !isSubmitting) {
      handleClose()
    }

    // Ctrl+Enter 提交表單
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isSubmitting) {
      // 創建一個模擬的表單提交事件
      const formEvent = new Event('submit', {
        bubbles: true,
        cancelable: true,
      }) as unknown as React.FormEvent<HTMLFormElement>
      handleSubmit(formEvent)
    }
  }

  /**
   * [Function] 處理表單提交
   * @param e 事件
   * @returns void
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // 如果使用者未登入，則提示登入
    if (!user) {
      alert('請先登入')
      return
    }
    // 如果標題為空，則提示輸入標題
    if (!title.trim()) {
      alert('請輸入標題')
      return
    }
    // 如果內容為空，則提示輸入內容
    if (!content.trim()) {
      alert('請輸入內容')
      return
    }

    setIsSubmitting(true)
    // 嘗試創建文章
    try {
      // 創建文章
      const postId = await createPost(
        user,
        {
          title: title.trim(),
          contentMarkdown: content.trim(),
          category,
        },
        coverImage || undefined
      )
      // 提示文章發布成功
      alert('文章發布成功！')
      // 重置表單
      resetForm()
      // 發布成功後的回調函數
      onSuccess?.(postId)
      // 關閉模態視窗
      onClose()
    } catch (error) {
      console.error('Error creating post:', error)
      const errorMessage =
        error instanceof Error ? error.message : '發布失敗，請稍後再試'
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.visible : ''}`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className={`${styles.modal} ${isOpen ? styles.visible : ''}`}>
        {/* 標題 */}
        <div className={styles.header}>
          <h2>發布新文章</h2>
          <div className={styles.headerActions}>
            <HelpTooltip />
            <button
              onClick={handleClose}
              className={styles.closeButton}
              disabled={isSubmitting}
              aria-label="關閉"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
        {/* 內容 */}
        <div className={styles.content}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* 標題 */}
            <div className={styles.formGroup}>
              <label className={styles.label}>標題 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="輸入文章標題..."
                className={styles.input}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* 分類 */}
            <div className={styles.formGroup}>
              <label className={styles.label}>分類 *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategory)}
                className={styles.select}
                disabled={isSubmitting}
                required
              >
                {POST_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {POST_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            {/* 封面圖片 */}
            <div className={styles.formGroup}>
              <label className={styles.label}>封面圖片 (選填)</label>
              <div className={styles.imageUploadSection}>
                {!coverImagePreview ? (
                  <div
                    className={`${styles.imageUpload} ${
                      dragOver ? styles.dragOver : ''
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      disabled={isSubmitting}
                    />
                    <FontAwesomeIcon
                      icon={faUpload}
                      className={styles.uploadIcon}
                    />
                    <div className={styles.uploadText}>
                      <span className={styles.highlight}>點擊上傳</span>
                      <span> 或拖拽圖片到此處</span>
                      <br />
                      <span>支援 JPG, PNG, WebP 格式，最大 5MB</span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.imagePreview}>
                    <Image
                      src={coverImagePreview}
                      alt="封面預覽"
                      width={200}
                      height={150}
                      style={{ objectFit: 'cover' }}
                    />
                    <div className={styles.imageInfo}>
                      <div className={styles.fileName}>
                        {coverImage?.name || '圖片檔案'}
                      </div>
                      <div className={styles.fileSize}>
                        {coverImage && formatFileSize(coverImage.size)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className={styles.removeImageButton}
                      disabled={isSubmitting}
                      aria-label="移除圖片"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Markdown 編輯器 */}
            <div className={styles.editorSection}>
              <div className={styles.editorHeader}>
                <label className={styles.label}>內容 *</label>
              </div>
              <div className={styles.editorWrapper}>
                <MarkdownEditor
                  initialContent={content}
                  onChange={handleContentChange}
                  readOnly={isSubmitting}
                  hideToolbar={false}
                  placeholder="輸入文章內容..."
                />
              </div>
            </div>
          </form>
        </div>

        {/* 底部 */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <span>Ctrl+Enter 快速發布</span>
          </div>
          <div className={styles.footerRight}>
            <button
              type="button"
              onClick={handleClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              取消
            </button>
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault()
                handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
              }}
              className={styles.submitButton}
              disabled={isSubmitting || !title.trim() || !content.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className={styles.loadingSpinner} />
                  <span>
                    {coverImage ? '上傳圖片並發布中...' : '發布中...'}
                  </span>
                </>
              ) : (
                <span>發布文章</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePostModal
