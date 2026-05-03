import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MarkdownRenderer } from '@/app/components/Markdown'
import { getDocById, mainDocs } from '../docs'
import styles from './doc-content.module.scss'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Page from '@/app/components/page/Page'

export async function generateStaticParams() {
  return mainDocs.map((doc) => ({
    slug: doc.id,
  }))
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const doc = getDocById(slug)

  if (!doc) {
    notFound()
  }

  return (
    <Page style={styles.docContent}>
      <div className={styles.docContentContainer}>
        <div className={styles.docHeader}>
          <div className={styles.docInfo}>
            <FontAwesomeIcon icon={doc.icon} className={styles.docIcon} />
            <div className={styles.docMeta}>
              <h3>
                {doc.title}
                {doc.category && (
                  <span className={styles.docCategory}>{doc.category}</span>
                )}
              </h3>
              <p className={styles.docDescription}>{doc.description}</p>
            </div>
          </div>
        </div>

        <div className={styles.docMarkdown}>
          <MarkdownRenderer filePath={doc.filePath} />
        </div>
      </div>
    </Page>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const doc = getDocById(slug)

  if (!doc) {
    return {
      title: '文件未找到｜中臺機器人研究社',
    }
  }

  return {
    title: `${doc.title}｜中臺機器人研究社`,
    description: doc.description,
    openGraph: {
      title: `${doc.title}｜中臺機器人研究社`,
      description: doc.description,
    },
  }
}
