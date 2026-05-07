import styles from './about.module.scss'
import Page from '@/app/components/page/Page'
import Footer from '@/app/components/Footer/Footer'
import { metadata } from '@/app/utils/metadata'

// sections
import AboutHeroSection from './ui/AboutHeroSection/AboutHeroSection'
import OriginSection from './ui/OriginSection/OriginSection'
import CultureSection from './ui/CultureSection/CultureSection'
import PhilosophySection from './ui/PhilosophySection/PhilosophySection'
import ClubOfficer from './ui/ClubOfficer/ClubOfficer'
import OfficeLocationCard from '@/app/components/OfficeLocationCard/OfficeLocationCard'

/**
 * 關於頁面
 */
export default function About() {
  return (
    <Page
      style={styles.aboutContainer}
      maxWidth="none"
      backgroundGrid
      mouseDynamicGlow
      config={{ paddingBottom: false }}
    >
      <AboutHeroSection />
      <OriginSection />
      <CultureSection />
      <PhilosophySection />
      <ClubOfficer />
      <Footer />
    </Page>
  )
}

export async function generateMetadata() {
  return metadata({
    title: '關於｜中臺機器人研究社',
    description:
      '了解中臺機器人研究社的成立宗旨、活動內容與社團成員介紹。我們致力於推廣機器人技術教育，提供學生實作與學習的平台。',
    keywords: ['關於我們', '社團介紹', '成員介紹', '社團宗旨'],
    url: '/about',
    image: '/assets/image/metadata-backgrounds/about.webp',
    category: 'about',
  })
}
