import styles from './page.module.scss'

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
}: {
  style?: string
  maxWidth?: string
  header?: {
    title?: string
    descriptions?: string[]
  }
  children: React.ReactNode
}) {
  return (
    <div className={styles.page}>
      <div className={`${styles.pageContainer} ${style}`} style={{ maxWidth }}>
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
