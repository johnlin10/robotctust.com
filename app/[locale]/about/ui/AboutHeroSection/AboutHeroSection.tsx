import styles from './AboutHeroSection.module.scss'
import ScrollAnimation from '@/app/components/animation/ScrollAnimation/ScrollAnimation'

/**
 * 關於頁面 Hero 區域
 */
export default function AboutHeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <ScrollAnimation
          className={styles.eyebrow}
          animation="fade"
          delay={0}
          once
        >
          <span>ROBOT CTUST · 關於我們</span>
        </ScrollAnimation>
        <ScrollAnimation
          className={styles.headline}
          animation="fadeInUp"
          delay={80}
          once
        >
          <h1>
            比較像一間
            <br />
            工作坊
          </h1>
        </ScrollAnimation>
        <ScrollAnimation
          className={styles.tagline}
          animation="fadeInUp"
          delay={160}
          once
        >
          <p>
            我們不一定有完美的答案，
            <br />
            但一定有為了熱情而努力的痕跡。
          </p>
        </ScrollAnimation>
        <ScrollAnimation animation="fadeInUp" delay={240} once>
          <p className={styles.foundingNote}>2024 年 · 由三位學生創立</p>
        </ScrollAnimation>
      </div>
      {/* 逐字從右往左進場的浮水印 */}
      <div className={styles.watermark} aria-hidden="true">
        {['A', 'B', 'O', 'U', 'T'].map((letter, i, arr) => (
          <ScrollAnimation
            key={i}
            className={styles.letter}
            animation="fadeInRight"
            delay={(arr.length - 1 - i) * 100}
            once
          >
            <span>{letter}</span>
          </ScrollAnimation>
        ))}
      </div>
    </section>
  )
}
