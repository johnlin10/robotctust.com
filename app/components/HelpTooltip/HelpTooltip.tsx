'use client'

import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestion, faTimes } from '@fortawesome/free-solid-svg-icons'
import styles from './HelpTooltip.module.scss'

export interface HelpTooltipProps {
  content?: React.ReactNode
  className?: string
  triggerClassName?: string
}

const defaultMarkdownContent = (
  <div>
    <h4>基本語法</h4>
    <ul>
      <li>
        <code># 標題</code> - 一級標題
      </li>
      <li>
        <code>## 標題</code> - 二級標題
      </li>
      <li>
        <code>**粗體**</code> - <strong>粗體文字</strong>
      </li>
      <li>
        <code>*斜體*</code> - <em>斜體文字</em>
      </li>
    </ul>

    <h4>連結與圖片</h4>
    <ul>
      <li>
        <code>[連結文字](網址)</code> - 建立連結
      </li>
      <li>
        <code>![圖片描述](圖片網址)</code> - 插入圖片
      </li>
    </ul>

    <h4>清單</h4>
    <ul>
      <li>
        <code>- 項目</code> - 無序清單
      </li>
      <li>
        <code>1. 項目</code> - 有序清單
      </li>
    </ul>

    <h4>程式碼</h4>
    <ul>
      <li>
        <code>`程式碼`</code> - 行內程式碼
      </li>
      <li>
        <div className={styles.example}>
          ```javascript
          <br />
          程式碼區塊
          <br />
          ```
        </div>
      </li>
    </ul>

    <h4>其他</h4>
    <ul>
      <li>
        <code>&gt; 引用</code> - 引用文字
      </li>
      <li>
        <code>---</code> - 分隔線
      </li>
    </ul>
  </div>
)

/**
 * [Component] 幫助工具提示
 */
const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content = defaultMarkdownContent,
  className = '',
  triggerClassName = '',
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const toggleTooltip = () => {
    setIsVisible(!isVisible)
  }

  const closeTooltip = () => {
    setIsVisible(false)
  }

  // 點擊外部關閉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false)
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible])

  // ESC 鍵關閉
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsVisible(false)
      }
    }

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isVisible])

  // 防止滾動穿透 (手機版)
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isVisible])

  return (
    <>
      <div ref={containerRef} className={`${styles.container} ${className}`}>
        <button
          onClick={toggleTooltip}
          className={`${styles.trigger} ${triggerClassName} ${
            isVisible ? styles.active : ''
          }`}
          aria-label="顯示說明"
        >
          <FontAwesomeIcon icon={faQuestion} />
        </button>

        <div
          ref={popoverRef}
          className={`${styles.popover} ${isVisible ? styles.visible : ''}`}
        >
          <div className={styles.header}>
            <h3>Markdown 語法說明</h3>
            <button
              onClick={closeTooltip}
              className={styles.closeButton}
              aria-label="關閉說明"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className={styles.content}>{content}</div>
        </div>
      </div>

      {/* 手機版遮罩 */}
      <div
        className={`${styles.overlay} ${isVisible ? styles.visible : ''}`}
        onClick={closeTooltip}
      />
    </>
  )
}

export default HelpTooltip
