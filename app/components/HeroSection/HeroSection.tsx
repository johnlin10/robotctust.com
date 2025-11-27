import Image from 'next/image'
import styles from './HeroSection.module.scss'
import ScrollAnimation from '@/app/components/animation/ScrollAnimation/ScrollAnimation'

/**
 * 首頁主視覺區域
 */
export default function HeroSection() {
  return (
    <section className={styles.heroSection}>
      <div className={styles.firstRow}>
        <ScrollAnimation animation="fadeInUp" once={false}>
          <Image
            src="/assets/image/home/robotctust-home-image.png"
            alt="中臺機器人研究社"
            width={96}
            height={96}
            className={styles.homeImage}
          />
        </ScrollAnimation>
        <ScrollAnimation animation="fadeInUp" delay={50} once={false}>
          <p className={styles.clubName}>中臺科技大學 機器人研究社</p>
        </ScrollAnimation>
        <ScrollAnimation animation="fadeInUp" delay={100} once={false}>
          <h1>
            從創意到實戰
            <br />
            打造你的<span className="nowrap">機器人宇宙</span>
          </h1>
        </ScrollAnimation>
        <ScrollAnimation animation="fadeInUp" delay={200} once={false}>
          <p>
            我們是一個將創意、<span className="nowrap">技術與熱情結合，</span>
            <span className="nowrap">親手打造未來可能性的實作基地。</span>
          </p>
        </ScrollAnimation>
      </div>
      <ScrollAnimation
        animation="zoomIn"
        className={styles.floatingText}
        once={false}
      >
        <span>
          <span className="nowrap">ROBOT</span>
          <span className="nowrap">CTUST</span>
        </span>
      </ScrollAnimation>
    </section>
  )
}
