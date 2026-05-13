import styles from './about.module.scss'
import Page from '@/app/components/page/Page'
import Footer from '@/app/components/Footer/Footer'
import { metadata } from '@/app/utils/metadata'
import { getTranslations } from 'next-intl/server'

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
  const t = await getTranslations('About')
  return metadata({
    title: t('meta.title'),
    description: t('meta.description'),
    keywords: t('meta.keywords').split(','),
    url: '/about',
    image: '/assets/image/metadata-backgrounds/about.webp',
    category: 'about',
  })
}
