'use client'

import styles from './Skeleton.module.scss'

// ─────────────────────────────────────────────────────
// SkeletonBlock — 基礎占位塊，可自由組合自訂版型
// ─────────────────────────────────────────────────────
interface SkeletonBlockProps {
  width?: string
  height?: string
  borderRadius?: string
  className?: string
}

export function SkeletonBlock({
  width = '100%',
  height = '1em',
  borderRadius = '6px',
  className,
}: SkeletonBlockProps) {
  return (
    <div
      className={`${styles.block}${className ? ` ${className}` : ''}`}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  )
}

// ─────────────────────────────────────────────────────
// Skeleton — 預設版型 + 排版容器
// ─────────────────────────────────────────────────────
export type SkeletonVariant =
  | 'text'       // 純文字行
  | 'stat'       // 統計卡 (標籤 + 大數字)
  | 'card'       // 內容卡 (圖示 + 標題 + 說明)
  | 'table-row'  // 表格列 (4 個欄位)
  | 'list-item'  // 清單項目 (標題 + 副標 + 右側動作)
  | 'section'    // 區塊 (標題列 + 3 個 list-item)

export type SkeletonLayout = 'list' | 'row' | 'grid'

interface SkeletonProps {
  variant?: SkeletonVariant
  count?: number
  layout?: SkeletonLayout
  className?: string
}

function renderItem(variant: SkeletonVariant, index: number) {
  switch (variant) {
    case 'stat':
      return (
        <div key={index} className={styles.statItem}>
          <SkeletonBlock width="60px" height="11px" borderRadius="4px" />
          <SkeletonBlock width="80px" height="32px" borderRadius="6px" />
        </div>
      )

    case 'card':
      return (
        <div key={index} className={styles.cardItem}>
          <div className={styles.cardItemHeader}>
            <SkeletonBlock width="24px" height="24px" borderRadius="6px" />
            <SkeletonBlock width="40%" height="18px" borderRadius="4px" />
          </div>
          <SkeletonBlock width="100%" height="13px" borderRadius="4px" />
          <SkeletonBlock width="70%" height="13px" borderRadius="4px" />
        </div>
      )

    case 'table-row':
      return (
        <div key={index} className={styles.tableRowItem}>
          <SkeletonBlock width="72px"  height="14px" borderRadius="4px" />
          <SkeletonBlock width="130px" height="14px" borderRadius="4px" />
          <SkeletonBlock width="110px" height="14px" borderRadius="4px" />
          <SkeletonBlock width="56px"  height="14px" borderRadius="4px" />
        </div>
      )

    case 'list-item':
      return (
        <div key={index} className={styles.listItem}>
          <div className={styles.listItemMain}>
            <SkeletonBlock width="100px" height="16px" borderRadius="4px" />
            <SkeletonBlock width="160px" height="13px" borderRadius="4px" />
          </div>
          <SkeletonBlock width="28px" height="28px" borderRadius="6px" />
        </div>
      )

    case 'section':
      return (
        <div key={index} className={styles.sectionItem}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderLeft}>
              <SkeletonBlock width="140px" height="22px" borderRadius="6px" />
              <SkeletonBlock width="60px"  height="22px" borderRadius="100px" />
            </div>
            <SkeletonBlock width="90px" height="32px" borderRadius="8px" />
          </div>
          <div className={styles.sectionBody}>
            <SkeletonBlock width="100%" height="52px" borderRadius="10px" />
            <SkeletonBlock width="100%" height="52px" borderRadius="10px" />
            <SkeletonBlock width="100%" height="52px" borderRadius="10px" />
          </div>
        </div>
      )

    case 'text':
    default:
      // 每第 3 行縮短，模擬真實段落
      return (
        <SkeletonBlock
          key={index}
          width={index % 3 === 2 ? '65%' : '100%'}
          height="14px"
          borderRadius="4px"
        />
      )
  }
}

export function Skeleton({
  variant = 'text',
  count = 1,
  layout = 'list',
  className,
}: SkeletonProps) {
  const layoutClass = styles[layout] ?? styles.list

  return (
    <div
      className={`${styles.container} ${layoutClass}${className ? ` ${className}` : ''}`}
      role="status"
      aria-label="載入中"
    >
      {Array.from({ length: count }, (_, i) => renderItem(variant, i))}
    </div>
  )
}
