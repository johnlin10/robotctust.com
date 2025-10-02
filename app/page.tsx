import Image from 'next/image'
import styles from './home.module.scss'
// components
import Page from './components/page/Page'
import Footer from './components/Footer/Footer'
// data
import { howWeLearn } from './messages/howWeLearn'
// utils
import { metadata } from './utils/metadata'

/**
 * 首頁
 */
export default function Home() {
  return (
    <Page style={styles.homeContainer} maxWidth="none">
      <section className={styles.headerSection}>
        <div className={styles.firstRow}>
          <Image
            src="/assets/image/home/robotctust-home-image.png"
            alt="中臺機器人研究社"
            width={96}
            height={96}
            className={styles.homeImage}
          />
          <h1>中臺機器人研究社</h1>
          <p>從創意到實戰，打造你的機器人宇宙。</p>
        </div>
        <div className={styles.robotContainer}>
          <Image
            src="/assets/image/home/robot-background@0.5x.webp"
            alt="中臺機器人研究社"
            width={1080}
            height={1080}
            className={styles.robotBackground}
          />
          <Image
            src="/assets/image/home/robot-v1@0.5x.webp"
            alt="中臺機器人研究社"
            width={540}
            height={480}
            className={styles.robotImage}
          />
        </div>
      </section>
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
              <div className={styles.card} key={item.title}>
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
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </Page>
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
  })
}
