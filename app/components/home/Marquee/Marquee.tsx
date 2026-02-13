import React from 'react'
import styles from './Marquee.module.scss'

interface MarqueeProps {
  /** 每條滾動條的內容陣列，最多支援 3 條 */
  items?: string[][]
  /** 滾動速度（秒），數字越大越慢 */
  speed?: number
}

/**
 * [component] Marquee 滾動條組件
 * - 1 條：單條水平滾動
 * - 2 條：X 交叉效果
 * - 3 條：兩條平行斜角 + 一條反向斜角
 * @param items 每條滾動條的內容陣列，最多支援 3 條
 * @param speed 滾動速度（秒），數字越大越慢
 * @example
 * <Marquee
 *   items={
 *     ['Next.js', 'SwiftUI', 'Arduino', 'Robotics', 'AI'],
 *     ['React', 'Swift', 'Python', 'Java', 'C++']
 *   }
 *   speed={20}
 * />
 */
export default function Marquee({
  items = [['Next.js', 'SwiftUI', 'Arduino', 'Robotics', 'AI']],
  speed = 20,
}: MarqueeProps) {
  const tracks = items.slice(0, 3) // 最多 3 條
  const trackCount = tracks.length

  // 根據條數決定容器的 class
  const containerClass = [
    styles.container,
    trackCount === 1 && styles.single,
    trackCount === 2 && styles.double,
    trackCount === 3 && styles.triple,
  ]
    .filter(Boolean)
    .join(' ')

  /**
   * [function] 取得軌道類名
   * - 單條：styles.track
   * - 雙條：styles.track + styles.skew_right 或 styles.skew_left
   * - 三條：styles.track + styles.skew_right 或 styles.skew_left
   * @param index 軌道索引
   * @returns 軌道類名
   */
  const getTrackClass = (index: number) => {
    if (trackCount === 1) {
      return styles.track
    }
    if (trackCount === 2) {
      // X 交叉：第一條向右下斜，第二條向左下斜
      return index === 0
        ? `${styles.track} ${styles.skew_right}`
        : `${styles.track} ${styles.skew_left}`
    }
    if (trackCount === 3) {
      // 前兩條平行向右斜，第三條反向向左斜
      if (index < 2) {
        return `${styles.track} ${styles.skew_right}`
      }
      return `${styles.track} ${styles.skew_left}`
    }
    return styles.track
  }

  /**
   * [function] 決定滾動方向
   * @param index 軌道索引
   * @returns 是否反向
   */
  const isReverse = (index: number) => {
    if (trackCount === 2) {
      // 第二條反向
      return index === 1
    }
    if (trackCount === 3) {
      // 第三條反向
      return index === 2
    }
    return false
  }

  return (
    <div className={containerClass}>
      {tracks.map((trackItems, trackIndex) => {
        // 確保至少有足夠的項目填滿寬度
        // 基礎重複 4 次，如果項目太少則增加重複次數確保至少 20 個項目
        const MIN_ITEMS = 20
        const repeatCount = Math.max(
          4,
          Math.ceil(MIN_ITEMS / (trackItems.length || 1))
        )
        const repeatedItems = Array(repeatCount)
          .fill(null)
          .flatMap(() => trackItems)

        return (
          <div
            key={trackIndex}
            className={getTrackClass(trackIndex)}
            style={
              {
                '--speed': `${speed}s`,
                '--direction': isReverse(trackIndex) ? 'reverse' : 'normal',
              } as React.CSSProperties
            }
          >
            {/* 第一組內容 */}
            <div className={styles.scroll_content}>
              {repeatedItems.map((item, i) => (
                <React.Fragment key={`1-${i}`}>
                  <span className={styles.item_text}>{item}</span>
                  <span className={styles.dot}></span>
                </React.Fragment>
              ))}
            </div>
            {/* 第二組內容（無縫銜接用） */}
            <div className={styles.scroll_content} aria-hidden="true">
              {repeatedItems.map((item, i) => (
                <React.Fragment key={`2-${i}`}>
                  <span className={styles.item_text}>{item}</span>
                  <span className={styles.dot}></span>
                </React.Fragment>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
