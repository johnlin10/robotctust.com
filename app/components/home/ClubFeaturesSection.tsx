'use client'

import styles from './ClubFeaturesSection.module.scss'
import { useTranslations } from 'next-intl'

// components
import ScrollAnimation from '@/app/components/animation/ScrollAnimation/ScrollAnimation'

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHandshake,
  faUsers,
  faWrench,
} from '@fortawesome/free-solid-svg-icons'

/**
 * [component] 社團特色區域
 * @returns {JSX.Element} ClubFeaturesSection
 */
const ClubFeaturesSection = () => {
  const t = useTranslations('Home.ClubFeaturesSection')

  return (
    <section className={styles.clubFeaturesSection}>
      <div className={styles.container}>
        <ScrollAnimation animation="fadeInUp" once={false} threshold={0.5}>
          <h1>{t('title')}</h1>
        </ScrollAnimation>
        <div className={styles.featuresContainer}>
          <ScrollAnimation animation="fadeInUp" once={false} threshold={0.5}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <FontAwesomeIcon icon={faWrench} />
              </div>
              <h2>{t('features.0.title')}</h2>
              <p>{t('features.0.description')}</p>
            </div>
          </ScrollAnimation>
          <ScrollAnimation
            animation="fadeInUp"
            once={false}
            delay={50}
            threshold={0.5}
          >
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <h2>{t('features.1.title')}</h2>
              <p>{t('features.1.description')}</p>
            </div>
          </ScrollAnimation>
          <ScrollAnimation
            animation="fadeInUp"
            once={false}
            delay={100}
            threshold={0.5}
          >
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <FontAwesomeIcon icon={faHandshake} />
              </div>
              <h2>{t('features.2.title')}</h2>
              <p>{t('features.2.description')}</p>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  )
}

export default ClubFeaturesSection
