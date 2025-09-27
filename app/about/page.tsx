import styles from './about.module.scss'
import Page from '../components/page/Page'
import ClubOfficer from './ui/ClubOfficer/ClubOfficer'
import { MarkdownRenderer } from '../components/Markdown'
import { metadata } from '../utils/metadata'

export default function About() {
  return (
    <Page
      style={styles.aboutContainer}
      header={{
        title: '關於我們',
        descriptions: [
          '中臺機器人研究社是一個由中臺科技大學學生組成的社團，主要研究機器人技術，並且提供學生一個學習機器人技術的平台。',
        ],
      }}
    >
      <div className={styles.aboutContent}>
        <MarkdownRenderer filePath="/assets/docs/about.md" />
        <ClubOfficer />
        <div className={styles.contact}>
          <h2>聯絡我們</h2>
          <p>
            <a href="mailto:robotctust@gmail.com" className="link">
              robotctust@gmail.com
            </a>
          </p>
        </div>
      </div>
    </Page>
  )
}

export async function generateMetadata() {
  return metadata({
    title: '關於｜中臺機器人研究社',
    description:
      '了解中臺機器人研究社的成立宗旨、活動內容與社團成員介紹。我們致力於推廣機器人技術教育，提供學生實作與學習的平台。',
    keywords: ['關於我們', '社團介紹', '成員介紹', '社團宗旨'],
    url: '/about',
    category: 'about',
  })
}
