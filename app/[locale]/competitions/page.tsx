import React from 'react'
import { Metadata } from 'next'
import styles from './competitions.module.scss'
// components
import Page from '@/app/components/page/Page'
import CompetitionsClient from './CompetitionsClient'
// util
import { metadata } from '@/app/utils/metadata'
import { getTranslations } from 'next-intl/server'

function Competitions() {
  return (
    <Page
      style={styles.competitionsContainer}
      header={{
        title: '競賽資訊',
        descriptions: [
          '探索中臺機器人研究社的各項競賽活動，包含社團內部、校外，以及國家級、國際級競賽。',
          '透過時間線檢視即將到來的競賽和報名截止日期。',
        ],
      }}
    >
      <CompetitionsClient />
    </Page>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Competitions')
  return metadata({
    title: t('meta.title'),
    description: t('meta.description'),
    keywords: t('meta.keywords').split(','),
    image: '/assets/image/metadata-backgrounds/competitions.webp',
    url: '/competitions',
    category: 'competitions',
  })
}

export default Competitions
