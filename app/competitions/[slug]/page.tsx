import React from 'react'
import { Metadata } from 'next'
import styles from './CompetitionsDetail.module.scss'
// components
import Page from '../../components/page/Page'
import CompetitionDetail from './CompetitionsDetail'
// utils
import { metadata, formatDateTimeToISO } from '../../utils/metadata'
import { getAllCompetitions } from '../../utils/competitionService'
// types
import { Competition } from '@/app/types/competition'

interface CompetitionDetailProps {
  params: Promise<{
    slug: string
  }>
}

/**
 * [Function] 競賽詳細頁面靜態參數
 * @returns
 */
export async function generateStaticParams() {
  const competitions = await getAllCompetitions()
  return competitions.map((competition: Competition) => ({
    slug: competition.id,
  }))
}

/**
 * [Page] 競賽詳細頁面
 * @param params 參數
 * @returns
 */
export default async function CompetitionDetailPage({
  params,
}: CompetitionDetailProps) {
  const { slug } = await params

  // 獲取所有競賽資料
  const competitions = await getAllCompetitions()

  // 根據 slug 找到對應的競賽
  const competition = competitions.find((comp) => comp.id === slug)

  // 如果找不到競賽，返回 404 頁面
  if (!competition) {
    return (
      <Page>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>競賽不存在</h1>
          <p>找不到 ID 為 {slug} 的競賽。</p>
        </div>
      </Page>
    )
  }

  return (
    <Page style={styles.competitionDetail}>
      <CompetitionDetail competition={competition} />
    </Page>
  )
}

/**
 * [Function] 競賽詳細頁面 metadata
 * @param params 參數
 * @returns
 */
export async function generateMetadata({
  params,
}: CompetitionDetailProps): Promise<Metadata> {
  const { slug } = await params

  // 獲取競賽資料來生成動態 meta
  const competitions = await getAllCompetitions()
  const competition = competitions.find((comp) => comp.id === slug)

  const title = competition
    ? `競賽詳情｜${competition.title}｜中臺機器人研究社`
    : `競賽詳情｜${slug}｜中臺機器人研究社`

  const description = competition
    ? `${competition.description}`
    : `查看 ${slug} 競賽的詳細資訊，包含競賽規則、時程安排與報名方式。`

  return metadata({
    title,
    description,
    keywords: ['競賽詳情', slug, '比賽資訊', ...(competition?.tags || [])],
    image:
      competition?.image ||
      '/assets/icons/web-icon/robotctust-web-icon-1024.png',
    url: `/competitions/${slug}`,
    type: 'article',
    publishedTime: formatDateTimeToISO(competition?.createdAt),
    modifiedTime: formatDateTimeToISO(competition?.updatedAt),
    category: 'competition-detail',
  })
}
