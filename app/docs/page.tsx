import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './docs.module.scss'
import { docs } from './docs'
import { Metadata } from 'next'
import Page from '../components/page/Page'

export default function DocsPage() {
  return (
    <Page
      style={styles.docsContainer}
      header={{
        title: '社團文檔',
        descriptions: [
          '這裡包含了中臺機器人研究社的各種重要文件，包括組織章程、管理辦法及發展規劃等。',
        ],
      }}
    >
      <div className={styles.docsContent}>
        <div className={styles.docsGrid}>
          {docs.map((doc) => (
            <Link
              key={doc.id}
              href={`/docs/${doc.id}`}
              className={styles.docCard}
            >
              <FontAwesomeIcon icon={doc.icon} className={styles.docIcon} />
              <h3 className={styles.docTitle}>{doc.title}</h3>
              <p className={styles.docDescription}>{doc.description}</p>
              {doc.category && (
                <span className={styles.docCategory}>{doc.category}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </Page>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '社團文件｜中臺機器人研究社',
    description:
      '中臺機器人研究社的重要文件，包括組織章程、管理辦法及發展規劃等',
    openGraph: {
      title: '社團文件｜中臺機器人研究社',
      description:
        '中臺機器人研究社的重要文件，包括組織章程、管理辦法及發展規劃等',
    },
  }
}
