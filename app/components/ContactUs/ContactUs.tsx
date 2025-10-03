import styles from './ContactUs.module.scss'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'

function ContactUs() {
  return (
    <div className={styles.contact}>
      <h2 className={styles.blockTitle}>
        <Link href="/contact">
          聯絡我們 <FontAwesomeIcon icon={faChevronRight} />
        </Link>
      </h2>
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

      <div className={styles.contactItem}>
        <p className={styles.labelTitle}>社團辦公室</p>
        <Link href="/contact" className="link">
          中臺科技大學 天機教學大樓 2323
        </Link>
      </div>
    </div>
  )
}

export default ContactUs
