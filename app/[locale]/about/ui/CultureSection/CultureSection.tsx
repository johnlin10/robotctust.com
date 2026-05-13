import styles from './CultureSection.module.scss'
import ScrollAnimation from '@/app/components/animation/ScrollAnimation/ScrollAnimation'
import { getTranslations } from 'next-intl/server'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWrench, faUsers, faLightbulb } from '@fortawesome/free-solid-svg-icons'

const momentIcons: IconDefinition[] = [faWrench, faUsers, faLightbulb]

/**
 * 社團文化區域
 */
export default async function CultureSection() {
  const t = await getTranslations('About.culture')

  const moments = momentIcons.map((icon, i) => ({
    icon,
    title: t(`moments.${i}.title`),
    description: t(`moments.${i}.description`),
  }))

  return (
    <section className={styles.culture}>
      <div className={styles.container}>
        {/* sectionLabel + h2 同步進場 */}
        <ScrollAnimation
          className={styles.headingGroup}
          animation="fadeInUp"
          once={false}
        >
          <span>{t('label')}</span>
          <h2>{t('heading')}</h2>
        </ScrollAnimation>

        {/* 敘述段落 */}
        <ScrollAnimation
          className={styles.narrative}
          animation="fadeInUp"
          delay={60}
          once={false}
        >
          <p>{t('narrative')}</p>
        </ScrollAnimation>

        {/* 工作坊情境卡片（className 在 ScrollAnimation 上，animated.div 即為卡片本體） */}
        <div className={styles.momentGrid}>
          {moments.map((moment, index) => (
            <ScrollAnimation
              key={moment.title}
              className={styles.momentCard}
              animation="fadeInUp"
              delay={index * 80}
              once={false}
              threshold={0.2}
            >
              <div className={styles.iconWrapper}>
                <FontAwesomeIcon icon={moment.icon} />
              </div>
              <h3>{moment.title}</h3>
              <p>{moment.description}</p>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  )
}
