import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './docs.module.scss'
import { mainDocs } from './docs'
import { Metadata } from 'next'
import { metadata } from '../utils/metadata'
import Page from '../components/page/Page'
import SubDocsClient from './ui/SubDocsClient/SubDocsClient'

export default function DocsPage() {
  return (
    <Page
      style={styles.docsContainer}
      header={{
        title: '社團文檔',
        descriptions: [
          '這裡包含了中臺機器人研究社的各種重要文件，以及課程需要使用的資料。',
        ],
      }}
    >
      <div className={styles.docsContent}>
        <div className={styles.subDocs}>
          <SubDocsClient />
        </div>
        <div className={styles.mainDocs}>
          <h2>社團文件</h2>
          <div className={styles.mainDocsContent}>
            {mainDocs.map((doc) => (
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
      </div>
    </Page>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return metadata({
    title: '社團文件｜中臺機器人研究社',
    description:
      '中臺機器人研究社的重要文件，包括組織章程、管理辦法及發展規劃等',
    image: '/assets/image/metadata-backgrounds/docs.webp',
    keywords: ['社團文件', '組織章程', '管理辦法', '發展規劃'],
    url: '/docs',
    category: 'docs',
  })
}
