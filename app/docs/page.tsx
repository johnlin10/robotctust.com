import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './docs.module.scss'
import { mainDocs, subDocs } from './docs'
import { Metadata } from 'next'
import { metadata } from '../utils/metadata'
import Page from '../components/page/Page'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

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
        <div className={styles.mainDocs}>
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
        <div className={styles.subDocs}>
          {subDocs.map((docGroup) => (
            <div className={styles.docGroup} key={docGroup.id}>
              <h3>{docGroup.title}</h3>
              {docGroup.docs.map((subDoc) => (
                <div className={styles.subDoc} key={subDoc.id}>
                  <h4 className={styles.subDocTitle}>{subDoc.title}</h4>
                  <div className={styles.subDocDocs}>
                    {subDoc.docs.map((doc) => (
                      <Link
                        key={doc.id}
                        href={doc.filePath}
                        className={styles.subDocLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`查看 ${doc.title} 文件`}
                      >
                        {doc.icon && (
                          <FontAwesomeIcon
                            icon={doc.icon}
                            className={styles.fileIcon}
                          />
                        )}
                        <h4 className={styles.subDocTitle}>{doc.title}</h4>
                        <span className={styles.subDocType}>{doc.type}</span>
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className={styles.linkIcon}
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
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
