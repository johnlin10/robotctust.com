import { Suspense } from 'react'
import styles from './home.module.scss'
// components
import Page from './components/page/Page'
import Footer from './components/Footer/Footer'
import HeroSection from './components/HeroSection/HeroSection'
import ClubFeaturesSection from './components/home/ClubFeaturesSection'
import LatestUpdatesSection from './components/home/LatestUpdatesSection'
import UpcomingCompetitionsSection from './components/home/UpcomingCompetitionsSection'
import Loading from './components/Loading/Loading'
// data
import { howWeLearn } from './messages/howWeLearn'
// utils
import { metadata } from './utils/metadata'
import { TiltCard } from './components/TiltCard'
import FadeInUp from './competitions/animation/FadeInUp/FadeInUp'

/**
 * 首頁
 */
export default function Home() {
  return (
    <Page style={styles.homeContainer} maxWidth="none">
      <HeroSection />

      <OurMissionSection />

      <ClubFeaturesSection />

      <section className={styles.howWeLearnSection}>
        <div className={styles.howWeLearnContainer}>
          <div className={styles.headerContainer}>
            <h2>我們如何學習與成長？</h2>
            <p>
              在機器人研究社，我們相信「做中學」是最好的成長方式。
              <br />
              我們規劃了由淺入深的學習路徑，無論你是完全沒接觸過的新手，還是已有基礎的同好，都能在這裡找到屬於你的舞台，享受動手創造的樂趣！
            </p>
          </div>
          <div className={styles.cardContainer}>
            {howWeLearn.map((item) => (
              <TiltCard className={styles.card} key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className={styles.points}>
                  <p>{item.points.title}</p>
                  <ul>
                    {item.points.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      <Suspense fallback={<Loading />}>
        <LatestUpdatesSection />
      </Suspense>

      <Suspense fallback={<Loading />}>
        <UpcomingCompetitionsSection />
      </Suspense>
      <Footer />
    </Page>
  )
}

// 我們的使命
const OurMissionSection = () => {
  return (
    <section className={styles.ourMissionSection}>
      <div className={styles.container}>
        <FadeInUp>
          <h1>我們的使命</h1>
        </FadeInUp>
        <FadeInUp delay={100}>
          <p>
            我們的宗旨是推廣機器人技術，培養學生的動手實作能力、邏輯思維與團隊協作精神。我們致力於提供一個開放、資源共享的學習環境，讓社員不僅能精進專業技能，更能學會如何解決複雜的實際問題。
          </p>
        </FadeInUp>
      </div>
    </section>
  )
}

export async function generateMetadata() {
  return metadata({
    title: '中臺機器人研究社｜Robot Research Club of CTUST',
    description:
      '中臺機器人研究社是一個由中臺科技大學學生組成的社團，主要研究機器人技術，並且提供學生一個學習機器人技術的平台。',
    keywords: ['首頁', '主頁', '官方網站'],
    image: '/assets/image/metadata-backgrounds/global.webp',
    url: '/',
    type: 'website',
    category: 'home',
  })
}
