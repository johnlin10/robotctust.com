import styles from './OriginSection.module.scss'
import ScrollAnimation from '@/app/components/animation/ScrollAnimation/ScrollAnimation'
import { getTranslations } from 'next-intl/server'

const founders = [
  { name: '藍世錡', role: '社長' },
  { name: '趙泰齡', role: '副社長' },
  { name: '林昌龍', role: '技術' },
]

/**
 * 創社緣起區域
 */
export default async function OriginSection() {
  const t = await getTranslations('About.origin')

  return (
    <section className={styles.origin}>
      <div className={styles.container}>
        {/* 左欄：故事敘述 */}
        <div className={styles.textCol}>
          {/* sectionLabel + h2 同步進場 */}
          <ScrollAnimation
            className={styles.headingGroup}
            animation="fadeInUp"
            once={false}
          >
            <span>{t('label')}</span>
            <h2>{t('heading')}</h2>
          </ScrollAnimation>
          <ScrollAnimation
            className={styles.paragraph}
            animation="fadeInUp"
            delay={60}
            once={false}
          >
            <p>{t('paragraph1')}</p>
          </ScrollAnimation>
          <ScrollAnimation
            className={styles.paragraph}
            animation="fadeInUp"
            delay={100}
            once={false}
          >
            <p>{t('paragraph2')}</p>
          </ScrollAnimation>
          <ScrollAnimation
            className={styles.paragraph}
            animation="fadeInUp"
            delay={140}
            once={false}
          >
            <p>{t('paragraph3')}</p>
          </ScrollAnimation>
        </div>

        {/* 右欄：創辦資訊卡片（className 在 ScrollAnimation 上） */}
        <div className={styles.accentCol}>
          <ScrollAnimation
            className={styles.accentCard}
            animation="fadeInUp"
            delay={80}
            once={false}
          >
            <div className={styles.accentYear}>
              <span className={styles.year}>2025</span>
              <span className={styles.yearLabel}>創社年份</span>
            </div>
            <hr className={styles.divider} />
            <div className={styles.foundersList}>
              <span className={styles.foundersLabel}>創辦人</span>
              {founders.map((founder) => (
                <div key={founder.name} className={styles.founderItem}>
                  <span className={styles.founderName}>{founder.name}</span>
                  <span className={styles.founderRole}>{founder.role}</span>
                </div>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  )
}
