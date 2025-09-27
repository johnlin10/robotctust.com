import styles from './Footer.module.scss'
import Image from 'next/image'

/**
 * [Component] 頁尾
 */
export default function Footer() {
  // 建立年份
  const firstYear = 2025
  // 目前年份
  const currentYear = new Date().getFullYear()
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <Image
                src="/assets/image/home/robotctust-home-image.png"
                alt="中臺機器人研究社"
                width={100}
                height={100}
              />
              <h1>中臺機器人研究社</h1>
            </div>
            <div className={styles.headerRight}></div>
          </div>
        </div>

        <div className={styles.copyright}>
          <p>
            Copyright ©{' '}
            {firstYear === currentYear
              ? currentYear
              : `${firstYear}-${currentYear}`}{' '}
            中臺機器人研究社
          </p>
          <p>
            <a href="https://github.com/johnlin10/robot-ctust" className="link">
              開放原始碼
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
