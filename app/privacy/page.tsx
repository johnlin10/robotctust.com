// import styles from './privacy.module.scss'
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
