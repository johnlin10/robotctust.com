import { Suspense } from 'react'
import styles from './home.module.scss'

// components
import Page from './components/page/Page'
import Footer from './components/Footer/Footer'
import HeroSection from './components/HeroSection/HeroSection'
import ClubFeaturesSection from './components/home/ClubFeaturesSection'
import CoreProjects from './components/home/CoreProjects/CoreProjects'
import LatestUpdatesSection from './components/home/LatestUpdatesSection'
import Loading from './components/Loading/Loading'
import Marquee from './components/home/Marquee/Marquee'
import LessonIntro from './components/home/LessonIntro/LessonIntro'
import ScrollAnimation from './components/animation/ScrollAnimation/ScrollAnimation'

// utils
import { metadata } from './utils/metadata'

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBullseye } from '@fortawesome/free-solid-svg-icons'

/**
 * 首頁
 */
export default function Home() {
  return (
    <Page
      style={styles.homeContainer}
      maxWidth="none"
      backgroundGrid={true}
      mouseDynamicGlow={true}
      config={{
        paddingBottom: false,
      }}
    >
      <HeroSection />
      <OurMissionSection />
      <CoreProjects />
      <Marquee
        items={[
          [
            'Robotics',
            'AI',
            'IoT',
            'Arduino',
            'ESP32',
            'Raspberry Pi',
            'Micro:bit',
          ],
          ['Next.js', 'SwiftUI', 'React', 'Swift', 'Python', 'Java', 'C++'],
          ['循線', '避障', '路徑規劃', '機器手臂', '自走車'],
        ]}
        speed={60}
      />
      <ClubFeaturesSection />
      <LessonIntro />

      <Suspense fallback={<Loading />}>
        <LatestUpdatesSection />
      </Suspense>

      {/* <Suspense fallback={<Loading />}>
        <UpcomingCompetitionsSection />
      </Suspense> */}
      <Footer />
    </Page>
  )
}

// 我們的使命
const OurMissionSection = () => {
  return (
    <section className={styles.ourMissionSection}>
      <div className={styles.container}>
        <FontAwesomeIcon icon={faBullseye} className={styles.missionIcon} />
        <ScrollAnimation animation="fadeInUp" once={false}>
          <h1>我們的使命</h1>
        </ScrollAnimation>
        <ScrollAnimation
          animation="fadeInUp"
          delay={50}
          once={false}
          threshold={0.4}
        >
          <p>
            我們的宗旨是推廣機器人技術，培養學生的動手實作能力、邏輯思維與團隊協作精神。我們致力於提供一個開放、資源共享的學習環境，讓社員不僅能精進專業技能，更能學會如何解決複雜的實際問題。
          </p>
        </ScrollAnimation>
      </div>
    </section>
  )
}

export async function generateMetadata() {
  return metadata({
    title: '中臺機器人研究社｜Robotics Research Club of CTUST',
    description:
      '中臺機器人研究社是一個由中臺科技大學學生組成的社團，主要研究機器人技術，並且提供學生一個學習機器人技術的平台。',
    keywords: ['首頁', '主頁', '官方網站'],
    image: '/assets/image/metadata-backgrounds/global.webp',
    url: '/',
    type: 'website',
    category: 'home',
  })
}
