import styles from './contact.module.scss'
import { Metadata } from 'next'
import { metadata } from '../utils/metadata'
import Link from 'next/link'
// components
import Page from '../components/page/Page'
import OfficeLocationCard from '../components/OfficeLocationCard/OfficeLocationCard'
// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { faInstagram } from '@fortawesome/free-brands-svg-icons'

function Contact() {
  return (
    <Page
      style={styles.contactContainer}
      header={{
        title: '聯絡我們',
      }}
    >
      <div className={styles.contactContent}>
        <OfficeLocationCard />
        <div className={styles.contactInfo}>
          <h2>聯絡資訊</h2>
          <div className={styles.contactItems}>
            <div className={styles.contactItem}>
              <p className={styles.labelTitle}>
                <FontAwesomeIcon icon={faEnvelope} />
                Email
              </p>
              <Link href="mailto:robotctust@gmail.com" className="link">
                robotctust@gmail.com
              </Link>
            </div>
            <div className={styles.contactItem}>
              <p className={styles.labelTitle}>
                <FontAwesomeIcon icon={faInstagram} />
                Instagram
              </p>
              <Link
                href="https://www.instagram.com/robotctust/"
                className="link"
              >
                @robotctust
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}

export function generateMetadata(): Metadata {
  return metadata({
    title: '聯絡我們',
    description: '聯絡中臺機器人研究社',
    keywords: ['聯絡我們', '聯絡方式', '聯絡管道'],
    url: '/contact',
    category: 'contact',
  })
}

export default Contact
