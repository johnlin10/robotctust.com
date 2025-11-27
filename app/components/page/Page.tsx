import styles from './page.module.scss'
import MouseDynamicGlow from '../MouseDynamicGlow/MouseDynamicGlow'

interface PageProps {
  style?: string
  maxWidth?: string
  header?: {
    title?: string
    descriptions?: string[]
  }
  children: React.ReactNode
  backgroundGrid?: boolean
  mouseDynamicGlow?: boolean
  config?: {
    paddingBottom?: boolean
  }
}

/**
 * 頁面組件
 * @param style 頁面樣式
 * @param maxWidth 頁面最大寬度(default: 960px)
 * @param header 頁面標題與描述
 * @param children 包含頁面內容
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
}: PageProps) {
  return (
    <div className={styles.page}>
      {mouseDynamicGlow ? <MouseDynamicGlow /> : null}
      {backgroundGrid ? <div className={styles.backgroundGrid}></div> : null}
      <div
        className={`${styles.pageContainer} ${
          config?.paddingBottom ? styles.paddingBottom : ''
        } ${style}`}
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
    </div>
  )
}
