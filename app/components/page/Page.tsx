import React, { ReactNode } from 'react'
import styles from './page.module.scss'
import MouseDynamicGlow from '../MouseDynamicGlow/MouseDynamicGlow'
import { AsideProvider } from '../Aside/AsideContext'

interface PageProps {
  style?: string
  maxWidth?: string
  header?: {
    title?: string
    descriptions?: string[]
  }
  children: ReactNode
  backgroundGrid?: boolean
  mouseDynamicGlow?: boolean
  config?: {
    paddingBottom?: boolean
  }
  aside?: ReactNode
}

/**
 * 頁面組件
 * @param style 頁面容器自定義 class
 * @param maxWidth 頁面最大寬度(default: 800px)
 * @param header 頁面標題與描述
 * @param children 包含頁面內容
 * @param aside 可以傳入 Aside 側邊欄（或經由 Next.js Parallel Routes 的 @aside slot 傳入）
 * @returns
 */
export default function Page({
  style,
  maxWidth = '800px',
  header,
  children,
  backgroundGrid = false,
  mouseDynamicGlow = false,
  config = {
    paddingBottom: true,
  },
  aside,
}: PageProps) {
  return (
    <AsideProvider>
      <div className={styles.page}>
        {mouseDynamicGlow ? <MouseDynamicGlow /> : null}
        {backgroundGrid ? <div className={styles.backgroundGrid}></div> : null}
        
        <div className={styles.pageLayout}>
          {aside && <div className={styles.asideSlot}>{aside}</div>}

          <main className={styles.mainContent}>
            <div
              className={`${styles.pageContainer} ${
                config?.paddingBottom ? styles.paddingBottom : ''
              } ${style || ''}`}
              style={{ maxWidth }}
            >
              {(header?.title || header?.descriptions) && (
                <div className={styles.pageHeader}>
                  {header?.title ? <h1>{header?.title}</h1> : null}
                  {header?.descriptions ? (
                    <div className={styles.pageHeaderDescriptions}>
                      {header?.descriptions.map((description, index) => (
                        <p key={index}>{description}</p>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
              {children}
            </div>
          </main>
        </div>
      </div>
    </AsideProvider>
  )
}
