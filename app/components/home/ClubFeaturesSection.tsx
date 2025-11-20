'use client'

import React from 'react'
import styles from './ClubFeaturesSection.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHandshake,
  faUsers,
  faWrench,
} from '@fortawesome/free-solid-svg-icons'
import { TiltCard } from '../TiltCard'

const ClubFeaturesSection = () => {
  return (
    <section className={styles.clubFeaturesSection}>
      <div className={styles.container}>
        <h1>社團特色</h1>
        <div className={styles.featuresContainer}>
          <TiltCard className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FontAwesomeIcon icon={faWrench} />
            </div>
            <h2>實作導向</h2>
            <p>
              我們不紙上談兵。每位成員都有機會親手焊電路、寫程式、鎖螺絲，把想法變為現實。
            </p>
          </TiltCard>
          <TiltCard className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <h2>團隊精神</h2>
            <p>
              打造機器人絕非一人之功。在這裡，你將學會溝通、分工，並與夥伴一同面對挑戰。
            </p>
          </TiltCard>
          <TiltCard className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FontAwesomeIcon icon={faHandshake} />
            </div>
            <h2>跨領域合作</h2>
            <p>
              我們歡迎資工、電子、機械、工管等不同科系夥伴，不同專業的碰撞能激發最棒的火花。
            </p>
          </TiltCard>
        </div>
      </div>
    </section>
  )
}

export default ClubFeaturesSection
