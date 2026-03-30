'use client'

import React from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrowNight } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import styles from './CourseContentRenderer.module.scss'

export interface CourseContent {
  id: string
  type: string
  content: string
  program_id?: string
  order_index: number
}

interface CourseContentRendererProps {
  contents: CourseContent[]
}

export const CourseContentRenderer: React.FC<CourseContentRendererProps> = ({
  contents,
}) => {
  return (
    <article className={styles.courseContentWrapper}>
      {contents.map((block) => {
        // Generate an ID for TOC anchors
        const headerId = `block-${block.id}`

        switch (block.type) {
          case 'header1':
            return (
              <h1 key={block.id} id={headerId} className={styles.header1}>
                <span>{block.content}</span>
              </h1>
            )
          case 'header2':
            return (
              <h2 key={block.id} id={headerId} className={styles.header2}>
                <span>{block.content}</span>
              </h2>
            )
          case 'header3':
            return (
              <h3 key={block.id} id={headerId} className={styles.header3}>
                <span>{block.content}</span>
              </h3>
            )
          case 'text':
            return (
              <p key={block.id} className={styles.text}>
                {block.content}
              </p>
            )
          case 'code':
            return (
              <div key={block.id} className={styles.codeBlock}>
                <SyntaxHighlighter
                  language="cpp"
                  style={oneDark as any}
                  showLineNumbers
                  customStyle={{
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                  }}
                >
                  {block.content}
                </SyntaxHighlighter>
              </div>
            )
          case 'markdown':
            return (
              <div key={block.id} className={styles.markdownContent}>
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, children, ...props }) => (
                      <h1 id={`block-${block.id}-mdh1`} {...props}>
                        <span>{children}</span>
                      </h1>
                    ),
                    h2: ({ node, children, ...props }) => (
                      <h2 id={`block-${block.id}-mdh2`} {...props}>
                        <span>{children}</span>
                      </h2>
                    ),
                    h3: ({ node, children, ...props }) => (
                      <h3 id={`block-${block.id}-mdh3`} {...props}>
                        <span>{children}</span>
                      </h3>
                    ),
                    table: ({ node, ...props }) => (
                      <div className={styles.tableContainer}>
                        <table {...props} />
                      </div>
                    ),
                    code(props) {
                      const { children, className, node, ...rest } = props
                      const match = /language-(\w+)/.exec(className || '')
                      return match ? (
                        <SyntaxHighlighter
                          {...(rest as any)}
                          PreTag="div"
                          children={String(children).replace(/\n$/, '')}
                          language={match[1]}
                          style={oneDark as any}
                          customStyle={{ borderRadius: '6px' }}
                        />
                      ) : (
                        <code {...rest} className={styles.inlineCode}>
                          {children}
                        </code>
                      )
                    },
                  }}
                >
                  {block.content}
                </Markdown>
              </div>
            )
          case 'image':
            return (
              <div key={block.id} className={styles.imageBlock}>
                <img
                  src={block.content}
                  alt=""
                  className={styles.courseImage}
                />
              </div>
            )
          default:
            return (
              <div key={block.id} className={styles.unsupported}>
                [不支援的區塊格式: {block.type}]
              </div>
            )
        }
      })}
    </article>
  )
}
