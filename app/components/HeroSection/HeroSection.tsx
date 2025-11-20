import Image from 'next/image'
import styles from './HeroSection.module.scss'
import FadeInUp from '@/app/competitions/animation/FadeInUp/FadeInUp'

/**
 * 首頁主視覺區域
 */
export default function HeroSection() {
  return (
    <section className={styles.heroSection}>
      <div className={styles.firstRow}>
        <FadeInUp>
          <Image
            src="/assets/image/home/robotctust-home-image.png"
            alt="中臺機器人研究社"
            width={96}
            height={96}
            className={styles.homeImage}
          />
        </FadeInUp>
        <FadeInUp delay={50}>
          <p className={styles.clubName}>中臺科技大學 機器人研究社</p>
        </FadeInUp>
        <FadeInUp delay={100}>
          <h1>
            從創意到實戰
            <br />
            打造你的<span className="nowrap">機器人宇宙</span>
          </h1>
        </FadeInUp>
        <FadeInUp delay={200}>
          <p>
            我們是一個將創意、<span className="nowrap">技術與熱情結合，</span>
            <span className="nowrap">親手打造未來可能性的實作基地。</span>
          </p>
        </FadeInUp>
      </div>
      <span className={styles.floatingText}>ROBOTCTUST</span>
    </section>
  )
}
