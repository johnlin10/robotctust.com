import Image from 'next/image'
// import dynamic from 'next/dynamic'
import styles from './HeroSection.module.scss'

// const HeroScene = dynamic(() => import('./components/HeroScene/HeroScene'), {})

/**
 * 首頁主視覺區域
 */
export default function HeroSection() {
  return (
    <section className={styles.heroSection}>
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
        {/* <span className={styles.floatingText}>ROBOTCTUST</span> */}
      </div>
      {/* <HeroScene className={styles.heroScene} /> */}
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
  )
}
