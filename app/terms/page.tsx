import { Metadata } from 'next'
// import styles from './terms.module.scss'
// utils
import { metadata } from '../utils/metadata'
// components
import Page from '../components/page/Page'
import { MarkdownRenderer } from '../components/Markdown'

export default function Terms() {
  return (
    <Page
      // style={styles.termsContainer}
      header={{
        title: '服務條款',
        descriptions: ['最後更新：2025/10/02'],
      }}
    >
      <MarkdownRenderer filePath="/assets/docs/terms.md" />
    </Page>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return metadata({
    title: '服務條款｜中臺機器人研究社',
    description:
      '中臺機器人研究社官方服務條款完整規範網站使用規則，包含帳號註冊流程、Google 第三方登入機制、使用責任義務、行為準則禁止事項，以及服務中止權利。詳細說明個人資料收集保護、內容發布規範、違規處理機制與免責聲明，保障您安心使用社團網站服務與資訊。',
    keywords: ['服務條款', '使用條款', '使用者條款', '使用者協定'],
    url: '/terms',
    category: 'terms',
    publishedTime: '2025-10-02',
    modifiedTime: '2025-10-02',
  })
}
