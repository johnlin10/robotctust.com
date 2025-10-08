'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import styles from './MarkdownRenderer.module.scss'
// dependencies
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
// styles
import 'highlight.js/styles/github-dark.css'

export interface MarkdownRendererProps {
  content?: string
  filePath?: string
  className?: string
}

/**
 * Markdown 渲染器
 * @param content 內容
 * @param filePath 文件路徑
 * @param className 樣式類名
 * @returns 渲染後的 Markdown 內容（html 結構）
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  filePath,
  className = '',
}) => {
  // Markdown 內容
  const [markdownContent, setMarkdownContent] = useState<string>('')
  // 載入狀態
  const [loading, setLoading] = useState<boolean>(false)
  // 錯誤狀態
  const [error, setError] = useState<string | null>(null)

  // 當內容或文件路徑變化時，加載 Markdown 文件
  useEffect(() => {
    if (content) {
      setMarkdownContent(content)
    } else if (filePath) {
      loadMarkdownFile(filePath)
    }
  }, [content, filePath])

  /**
   * 加載 Markdown 文件
   * @param path 文件路徑
   */
  const loadMarkdownFile = async (path: string) => {
    setLoading(true)
    setError(null)

    // 嘗試加載 Markdown 文件
    try {
      // 加載 Markdown 文件
      const response = await fetch(path)
      // 如果加載失敗，則拋出錯誤
      if (!response.ok) {
        throw new Error(`Failed to load markdown file: ${response.statusText}`)
      }
      // 加載 Markdown 文件
      const text = await response.text()
      setMarkdownContent(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // 當正在加載時，顯示載入中
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">載入中...</div>
      </div>
    )
  }

  // 當加載失敗時，顯示錯誤
  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
      </div>
    )
  }

  return (
    <article className={`${styles.markdownContent} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          code({ children, ...props }) {
            return <code {...props}>{children}</code>
          },
          pre({ children }) {
            return <pre>{children}</pre>
          },
          blockquote({ children }) {
            return <blockquote>{children}</blockquote>
          },
          table({ children }) {
            return (
              <div className={styles.tableWrapper}>
                <table>{children}</table>
              </div>
            )
          },
          th({ children }) {
            return <th>{children}</th>
          },
          td({ children }) {
            return <td>{children}</td>
          },
          ol({ children, ...props }) {
            return <ol {...props}>{children}</ol>
          },
          ul({ children, ...props }) {
            const isTaskList = React.Children.toArray(children).some(
              (child: React.ReactNode) => {
                const className = (
                  child as React.ReactElement<{
                    node: { properties: { className: string } }
                  }>
                )?.props?.node?.properties?.className
                return Array.isArray(className)
                  ? className.includes('task-list-item')
                  : className === 'task-list-item'
              }
            )

            return (
              <ul
                className={isTaskList ? styles.taskList : undefined}
                {...props}
              >
                {children}
              </ul>
            )
          },
          li({ children }) {
            return <li>{children}</li>
          },
          h1({ children }) {
            return <h1>{children}</h1>
          },
          h2({ children }) {
            return <h2>{children}</h2>
          },
          h3({ children }) {
            return <h3>{children}</h3>
          },
          h4({ children }) {
            return <h4>{children}</h4>
          },
          h5({ children }) {
            return <h5>{children}</h5>
          },
          h6({ children }) {
            return <h6>{children}</h6>
          },
          p({ children }) {
            return <p>{children}</p>
          },
          img({ src, alt }) {
            // 如果沒有 src，返回空
            if (!src) return null

            // 使用 Next.js Image 元件優化圖片載入
            return (
              <span className={styles.imageWrapper}>
                <Image
                  src={typeof src === 'string' ? src : ''}
                  alt={alt || ''}
                  className={styles.markdownImage}
                  width={1200}
                  height={800}
                  loading="lazy"
                  quality={85}
                />
              </span>
            )
          },
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </article>
  )
}

export default MarkdownRenderer
