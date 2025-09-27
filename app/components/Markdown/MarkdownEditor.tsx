'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import styles from './MarkdownEditor.module.scss'
// component
import MarkdownRenderer from './MarkdownRenderer'
// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEye,
  faEyeSlash,
  faExpand,
  faCompress,
} from '@fortawesome/free-solid-svg-icons'

export interface MarkdownEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  className?: string
  readOnly?: boolean
  hideToolbar?: boolean
  placeholder?: string
}

/**
 * [Component] Markdown 編輯器
 *
 * @param initialContent 初始內容
 * @param onChange 內容變更回調
 * @param className 自定義 CSS 類名
 * @param readOnly 是否為只讀模式
 * @param hideToolbar 是否隱藏工具列
 * @param placeholder 輸入框佔位符
 * @returns Markdown 編輯器
 */
const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialContent = '',
  onChange,
  className = '',
  readOnly = false,
  hideToolbar = false,
  placeholder = '在此輸入 Markdown 內容...',
}) => {
  //* 核心狀態 - 只保留必要的狀態
  const [content, setContent] = useState<string>(initialContent)
  const [showPreview, setShowPreview] = useState<boolean>(true)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [isWideScreen, setIsWideScreen] = useState<boolean>(false)

  // textarea ref
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  //* 僅在 initialContent 確實變化且與當前內容不同時才更新
  useEffect(() => {
    if (initialContent !== content) {
      setContent(initialContent)
    }
  }, [initialContent])

  //* 內容變更處理 - 使用 useCallback 穩定引用
  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent)
      onChange?.(newContent)
    },
    [onChange]
  )

  //* 響應式設計檢測
  useEffect(() => {
    const checkScreenWidth = () => {
      setIsWideScreen(window.innerWidth >= 1024)
    }

    checkScreenWidth()
    window.addEventListener('resize', checkScreenWidth)

    return () => {
      window.removeEventListener('resize', checkScreenWidth)
    }
  }, [])

  //* 事件處理函數
  /**
   * 處理 Tab 鍵縮進
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const textarea = e.target as HTMLTextAreaElement
        const start = textarea.selectionStart
        const end = textarea.selectionEnd

        const newContent =
          content.substring(0, start) + '  ' + content.substring(end)
        handleContentChange(newContent)

        // 恢復游標位置
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2
        }, 0)
      }
    },
    [content, handleContentChange]
  )

  /**
   * 切換預覽模式
   */
  const togglePreview = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setShowPreview(!showPreview)
    },
    [showPreview]
  )

  /**
   * 切換全螢幕模式
   */
  const toggleFullscreen = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsFullscreen(!isFullscreen)
    },
    [isFullscreen]
  )

  /**
   * 聚焦到編輯器
   */
  // const focusEditor = useCallback(() => {
  //   textareaRef.current?.focus()
  // }, [])

  //* 計算佈局類別
  const getLayoutClasses = () => {
    const baseClasses = [styles.container]

    if (isFullscreen) baseClasses.push(styles.fullscreen)
    if (className) baseClasses.push(className)

    return baseClasses.join(' ')
  }

  const getContentAreaClasses = () => {
    const baseClasses = [styles.contentArea]

    if (showPreview && isWideScreen) {
      baseClasses.push(styles.sideBySide)
    } else {
      baseClasses.push(styles.stacked)
    }

    if (isFullscreen) {
      baseClasses.push(styles.fullscreenHeight)
    } else {
      baseClasses.push(styles.normalHeight)
    }

    return baseClasses.join(' ')
  }

  return (
    <div className={getLayoutClasses()}>
      {/* 工具列 */}
      {!hideToolbar && (
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <button
              onClick={togglePreview}
              className={styles.previewButton}
              type="button"
            >
              <FontAwesomeIcon icon={showPreview ? faEyeSlash : faEye} />
              <span>{showPreview ? '隱藏預覽' : '顯示預覽'}</span>
            </button>
          </div>

          <div className={styles.toolbarRight}>
            <button
              onClick={toggleFullscreen}
              className={styles.iconButton}
              type="button"
            >
              <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
            </button>
          </div>
        </div>
      )}

      {/* 內容區域 */}
      <div className={getContentAreaClasses()}>
        {/* 編輯器區域 */}
        <div className={styles.editorSection}>
          <div className={styles.editorWrapper}>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={styles.textarea}
              readOnly={readOnly}
              disabled={readOnly}
            />
          </div>
        </div>

        {/* 預覽區域 */}
        {showPreview && (
          <div className={styles.previewSection}>
            <div className={styles.previewWrapper}>
              <MarkdownRenderer content={content} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MarkdownEditor
