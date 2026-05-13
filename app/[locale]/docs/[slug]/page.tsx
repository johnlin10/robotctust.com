import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MarkdownRenderer } from '@/app/components/Markdown'
import { getDocById, mainDocs } from '../docs'
import styles from './doc-content.module.scss'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Page from '@/app/components/page/Page'
import { metadata } from '@/app/utils/metadata'
import { getTranslations } from 'next-intl/server'

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
  const t = await getTranslations('Docs')

  if (!doc) {
    notFound()
  }

  const translatedTitle = t(`documents.${doc.id}.title`)
  const translatedDescription = t(`documents.${doc.id}.description`)

  return (
    <Page style={styles.docContent}>
      <div className={styles.docContentContainer}>
        <div className={styles.docHeader}>
          <div className={styles.docInfo}>
            <FontAwesomeIcon icon={doc.icon} className={styles.docIcon} />
            <div className={styles.docMeta}>
              <h3>
                {translatedTitle}
                {doc.category && (
                  <span className={styles.docCategory}>
                    {t('courseMaterials.category')}
                  </span>
                )}
              </h3>
              <p className={styles.docDescription}>{translatedDescription}</p>
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
  const t = await getTranslations('Docs')
  const doc = getDocById(slug)

  if (!doc) {
    return metadata({
      title: t('meta.docNotFound'),
      description: '',
      noIndex: true,
    })
  }

  const translatedTitle = t(`documents.${doc.id}.title`)
  const translatedDescription = t(`documents.${doc.id}.description`)

  return metadata({
    title: t('meta.titleTemplate', { title: translatedTitle }),
    description: translatedDescription,
    keywords: t('meta.keywords').split(','),
    image: '/assets/image/metadata-backgrounds/docs.webp',
    url: `/docs/${slug}`,
    category: 'docs',
  })
}
