import React from 'react'
import { Metadata } from 'next'
import styles from './schedules.module.scss'
import Page from '../components/page/Page'
import SchedulesClient from './SchedulesClient'
import { metadata } from '../utils/metadata'

function Schedules() {
  return (
    <Page
      style={styles.schedulesContainer}
      maxWidth="1200px"
      header={{
        title: '行事曆',
        descriptions: [
          '檢視中臺機器人研究社的課程安排、競賽時程與社團活動。',
          '透過學年度選擇器切換不同學年的行事曆內容。',
        ],
      }}
    >
      <SchedulesClient />
    </Page>
  )
}

export function generateMetadata(): Metadata {
  return metadata({
    title: '行事曆｜中臺機器人研究社',
    description: '檢視中臺機器人研究社的課程安排、競賽時程與社團活動。',
    keywords: ['行事曆', '上課時間', '社團活動', '競賽時程', '社團上課時間'],
    url: '/schedules',
    category: 'schedules',
  })
}

export default Schedules
