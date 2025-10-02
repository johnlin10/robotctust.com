import Link from 'next/link'
import styles from './Footer.module.scss'
import Image from 'next/image'
// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faInstagram,
  faThreads,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons'

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

        <div className={styles.social}>
          <div className={styles.socialItems}>
            <Link
              href="https://www.instagram.com/robotctust/"
              className={`${styles.socialItem} ${styles.instagram}`}
              target="_blank"
            >
              <FontAwesomeIcon icon={faInstagram} />
            </Link>
            <Link
              href="https://www.threads.net/@robotctust"
              className={`${styles.socialItem} ${styles.threads}`}
              target="_blank"
            >
              <FontAwesomeIcon icon={faThreads} />
            </Link>
            <Link
              href="https://www.facebook.com/robotctust/"
              className={`${styles.socialItem} ${styles.twitter}`}
              target="_blank"
            >
              <FontAwesomeIcon icon={faXTwitter} />
            </Link>
          </div>
        </div>

        <div className={styles.contact}>
          <h2 className={styles.blockTitle}>聯絡我們</h2>
          <div className={styles.contactItem}>
            <p className={styles.labelTitle}>Email</p>
            <Link
              href="mailto:robotctust@gmail.com"
              className="link"
              target="_blank"
            >
              robotctust@gmail.com
            </Link>
          </div>
          <div className={styles.contactItem}>
            <p className={styles.labelTitle}>Instagram</p>
            <Link
              href="https://www.instagram.com/robotctust/"
              className="link"
              target="_blank"
            >
              @robotctust
            </Link>
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
        </div>
        <div className={styles.links}>
          <Link
            href="https://github.com/johnlin10/robot-ctust"
            className="link"
            target="_blank"
          >
            開放原始碼
          </Link>
          <Link href="/terms" className="link">
            服務條款
          </Link>
          <Link href="/privacy" className="link">
            隱私權政策
          </Link>
        </div>
      </div>
    </footer>
  )
}
