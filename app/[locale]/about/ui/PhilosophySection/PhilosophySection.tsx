import styles from './PhilosophySection.module.scss'
import ScrollAnimation from '@/app/components/animation/ScrollAnimation/ScrollAnimation'
import { getTranslations } from 'next-intl/server'

/**
 * 理念區域（置中引言風格）
 */
export default async function PhilosophySection() {
  const t = await getTranslations('About.philosophy')

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
          <h2>{t('heading')}</h2>
        </ScrollAnimation>

        {/* 主文 */}
        <ScrollAnimation
          className={styles.body}
          animation="fadeInUp"
          delay={120}
          once={false}
        >
          <p>{t('body')}</p>
        </ScrollAnimation>

        {/* 邀請語 callout */}
        <ScrollAnimation
          className={styles.invitation}
          animation="fadeInUp"
          delay={180}
          once={false}
        >
          <p>{t('invitation')}</p>
        </ScrollAnimation>
      </div>
    </section>
  )
}
