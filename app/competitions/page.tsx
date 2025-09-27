import React from 'react'
import { Metadata } from 'next'
import styles from './competitions.module.scss'
// components
import Page from '../components/page/Page'
import CompetitionsClient from './CompetitionsClient'
// util
import { metadata } from '../utils/metadata'

function Competitions() {
  return (
    <Page
      style={styles.competitionsContainer}
      maxWidth="960px"
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

export function generateMetadata(): Metadata {
  return metadata({
    title: '競賽｜中臺機器人研究社',
    description:
      '探索中臺機器人研究社參與的各項內外部競賽資訊，包含競賽時程、報名資格與獎項內容。',
    keywords: ['競賽', '比賽', '機器人競賽', '參賽資訊'],
    url: '/competitions',
    category: 'competitions',
  })
}

export default Competitions
