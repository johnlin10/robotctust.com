import { Metadata } from 'next'
// import styles from './privacy.module.scss'
// utils
import { metadata } from '../utils/metadata'
// components
import Page from '../components/page/Page'
import { MarkdownRenderer } from '../components/Markdown'

export default function Privacy() {
  return (
    <Page
      // style={styles.privacyContainer}
      header={{
        title: '隱私權政策',
        descriptions: ['最後更新：2025/10/02'],
      }}
    >
      <MarkdownRenderer filePath="/assets/docs/privacy.md" />
    </Page>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return metadata({
    title: '隱私權政策｜中臺機器人研究社',
    description:
      '中臺機器人研究社隱私權政策詳盡說明個人資料收集、使用與保護機制。包含 Google 第三方登入與電子郵件註冊資訊處理、資料利用原則、安全防護措施，以及您依個人資料保護法享有的查詢、補正、刪除等權利，確保您的隱私權益獲得完整保障。',
    keywords: ['隱私權政策', '隱私保護', '隱私政策', '隱私權'],
    url: '/privacy',
    category: 'privacy',
    publishedTime: '2025-10-02',
    modifiedTime: '2025-10-02',
  })
}
