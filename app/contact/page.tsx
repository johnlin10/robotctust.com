import styles from './contact.module.scss'
import { Metadata } from 'next'
import { metadata } from '../utils/metadata'
import Link from 'next/link'
// components
import Page from '../components/page/Page'
import OfficeLocationCard from '../components/OfficeLocationCard/OfficeLocationCard'
import FloatingActionBar, {
  ActionItem,
} from '../components/FloatingActionBar/FloatingActionBar'
// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { faInstagram } from '@fortawesome/free-brands-svg-icons'

function Contact() {
  const floatingActionBarActions: ActionItem[] = [
    {
      type: 'link',
      label: 'Email',
      title: '使用 Email 聯絡我們',
      icon: faEnvelope,
      labelVisible: true,
      href: 'mailto:robotctust@gmail.com',
      target: '_blank',
    },
    {
      type: 'link',
      label: 'Instagram',
      title: '到 Instagram 聯絡我們',
      icon: faInstagram,
      labelVisible: true,
      href: 'https://www.instagram.com/robotctust/',
      target: '_blank',
    },
  ]
  return (
    <Page
      style={styles.contactContainer}
      header={{
        title: '聯絡我們',
        descriptions: [
          '有事情要找我們嗎？',
          '不管是社團課程、技術問題，還是有任何意見與建議，歡迎透過以下方式聯絡我們',
        ],
      }}
    >
      <div className={styles.contactContent}>
        <OfficeLocationCard />
        <div className={styles.contactInfo}>
          <h2>聯絡資訊</h2>
          <address className={styles.contactItems}>
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
          </address>
        </div>
      </div>
      <FloatingActionBar actions={floatingActionBarActions} />
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
