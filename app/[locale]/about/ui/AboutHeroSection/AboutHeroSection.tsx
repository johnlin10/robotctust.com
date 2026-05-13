import styles from './AboutHeroSection.module.scss'
import ScrollAnimation from '@/app/components/animation/ScrollAnimation/ScrollAnimation'
import { getTranslations } from 'next-intl/server'

/**
 * 關於頁面 Hero 區域
 */
export default async function AboutHeroSection() {
  const t = await getTranslations('About.hero')

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <ScrollAnimation
          className={styles.eyebrow}
          animation="fade"
          delay={0}
          once
        >
          <span>{t('eyebrow')}</span>
        </ScrollAnimation>
        <ScrollAnimation
          className={styles.headline}
          animation="fadeInUp"
          delay={80}
          once
        >
          <h1>{t('title')}</h1>
        </ScrollAnimation>
        <ScrollAnimation
          className={styles.tagline}
          animation="fadeInUp"
          delay={160}
          once
        >
          <p>{t('subtitle')}</p>
        </ScrollAnimation>
        <ScrollAnimation
          className={styles.foundingNote}
          animation="fadeInUp"
          delay={240}
          once
        >
          <p>{t('foundingNote')}</p>
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
