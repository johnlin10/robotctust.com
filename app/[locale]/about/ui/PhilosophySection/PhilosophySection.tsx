import styles from './PhilosophySection.module.scss'
import ScrollAnimation from '@/app/components/animation/ScrollAnimation/ScrollAnimation'

/**
 * 理念區域（置中引言風格）
 */
export default function PhilosophySection() {
  return (
    <section className={styles.philosophy}>
      <div className={styles.container}>
        {/* 裝飾性大引號 */}
        <ScrollAnimation
          className={styles.quoteDecor}
          animation="fade"
          once={false}
        >
          <span aria-hidden="true">&ldquo;</span>
        </ScrollAnimation>

        {/* 主標題 */}
        <ScrollAnimation
          className={styles.heading}
          animation="fadeInUp"
          delay={60}
          once={false}
        >
          <h2>不是為了完美的成果</h2>
        </ScrollAnimation>

        {/* 主文 */}
        <ScrollAnimation
          className={styles.body}
          animation="fadeInUp"
          delay={120}
          once={false}
        >
          <p>
            我們更在意的，是每一次動手嘗試的過程、每一個敢問出口的問題、每一段為了搞清楚一件事而花掉的時光——這些才是一個社團真正留下的東西。
          </p>
        </ScrollAnimation>

        {/* 邀請語 callout */}
        <ScrollAnimation
          className={styles.invitation}
          animation="fadeInUp"
          delay={180}
          once={false}
        >
          <p>
            如果你在找一個可以真正動手做事、可以慢慢琢磨、可以和人一起面對玄學問題的地方。
            <strong>那你找對了。</strong>
          </p>
        </ScrollAnimation>
      </div>
    </section>
  )
}
