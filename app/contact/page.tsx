import styles from './contact.module.scss'
import Page from '../components/page/Page'
import { Metadata } from 'next'
import { metadata } from '../utils/metadata'

function Contact() {
  return (
    <Page
      style={styles.contactContainer}
      header={{
        title: '聯絡我們',
      }}
    >
      <div className={styles.contactContent}></div>
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
