// import styles from './terms.module.scss'
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
      <MarkdownRenderer filePath="/assets/docs/terms-of-service.md" />
    </Page>
  )
}
