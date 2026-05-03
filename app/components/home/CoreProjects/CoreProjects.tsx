'use client'

import { useState } from 'react'
import styles from './CoreProjects.module.scss'
import { useTranslations } from 'next-intl'

// components
import {
  WebVisual,
  RoboticsVisual,
  IOSVisual,
  OldRoboticsVisual,
} from './Visuals'
import ScrollAnimation from '@/app/components/animation/ScrollAnimation/ScrollAnimation'

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGlobe,
  faMobileScreenButton,
  faRobot,
} from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

export default function CoreProjects() {
  const t = useTranslations('Home.CoreProjects')
  const [activeTab, setActiveTab] = useState<
    'rrc-tracer-v2' | 'rrc-tracer-v1' | 'ios' | 'web'
  >('rrc-tracer-v1')

  return (
    <section className={styles.coreProjects}>
      <div className={styles.coreProjectsContainer}>
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <ScrollAnimation animation="fadeInUp" once={false}>
              <h1>{t('title')}</h1>
            </ScrollAnimation>
            <ScrollAnimation animation="fadeInUp" once={false} delay={50}>
              <p>{t('description')}</p>
            </ScrollAnimation>
          </div>
          <ScrollAnimation
            animation="zoomIn"
            once={false}
            delay={100}
            className={styles.switchContainerAnimation}
          >
            <div className={styles.switchContainer}>
              <button
                className={activeTab === 'rrc-tracer-v1' ? styles.active : ''}
                onClick={() => setActiveTab('rrc-tracer-v1')}
              >
                <FontAwesomeIcon icon={faRobot} />
                <span className={styles.buttonText}>{t('tabs.mentor')}</span>
              </button>
              {/* <button
                className={activeTab === 'rrc-tracer-v2' ? styles.active : ''}
                onClick={() => setActiveTab('rrc-tracer-v2')}
              >
                <FontAwesomeIcon icon={faRobot} />
                <span className={styles.buttonText}>{t('tabs.pathfinder')}</span>
              </button> */}
              <button
                className={activeTab === 'web' ? styles.active : ''}
                onClick={() => setActiveTab('web')}
              >
                <FontAwesomeIcon icon={faGlobe} />
                <span className={styles.buttonText}>
                  {t('tabs.web.1')}<span>{t('tabs.web.2')}</span>
                </span>
              </button>
              <button
                className={activeTab === 'ios' ? styles.active : ''}
                onClick={() => setActiveTab('ios')}
              >
                <FontAwesomeIcon icon={faMobileScreenButton} />
                <span className={styles.buttonText}>
                  {t('tabs.ios.1')}<span> {t('tabs.ios.2')}</span>
                </span>
              </button>
            </div>
          </ScrollAnimation>
        </div>
        <ScrollAnimation animation="fadeInUp" once={false} delay={150}>
          <div className={styles.container}>
            <div className={styles.staticContent}>
              {activeTab === 'web' && (
                <div className={styles.webContent}>
                  <div className={`${styles.statusBadge} ${styles.online}`}>
                    <span>{t('status.live')}</span>
                  </div>
                  <h1 className={styles.title}>{t('showcases.web.title')}</h1>
                  <p className={styles.description}>{t('showcases.web.subtitle')}</p>
                  <div className={styles.content}>
                    <p>
                      {t.rich('showcases.web.desc', {
                        strong: (chunks) => <strong>{chunks}</strong>
                      })}
                    </p>
                    <ul>
                      <li>{t('showcases.web.list.1')}</li>
                      <li>{t('showcases.web.list.2')}</li>
                      <li>{t('showcases.web.list.3')}</li>
                    </ul>
                  </div>
                  <div className={styles.actions}>
                    <button
                      onClick={() => {
                        window.open(
                          'https://github.com/johnlin10/robotctust.com',
                          '_blank',
                        )
                      }}
                    >
                      <FontAwesomeIcon icon={faGithub} />
                      <span className={styles.buttonText}>GitHub</span>
                    </button>
                  </div>
                </div>
              )}
              {activeTab === 'rrc-tracer-v1' && (
                <div className={styles.oldRoboticsContent}>
                  <div className={styles.statusBadge}>
                    <span>{t('status.active')}</span>
                  </div>
                  <h1 className={styles.title}>{t('showcases.mentor.title')}</h1>
                  <p className={styles.description}>
                    {t('showcases.mentor.subtitle')}
                  </p>
                  <div className={styles.content}>
                    <p>
                      {t.rich('showcases.mentor.desc', {
                        strong: (chunks) => <strong>{chunks}</strong>
                      })}
                    </p>
                    <ul>
                      <li>{t('showcases.mentor.list.1')}</li>
                      <li>{t('showcases.mentor.list.2')}</li>
                      <li>{t('showcases.mentor.list.3')}</li>
                    </ul>
                  </div>
                </div>
              )}
              {activeTab === 'rrc-tracer-v2' && (
                <div className={styles.roboticsContent}>
                  <div className={`${styles.statusBadge} ${styles.planning}`}>
                    <span>{t('status.planning')}</span>
                  </div>
                  <h1 className={styles.title}>{t('showcases.pathfinder.title')}</h1>
                  <p className={styles.description}>
                    {t('showcases.pathfinder.subtitle')}
                  </p>
                  <div className={styles.content}>
                    <p>
                      {t.rich('showcases.pathfinder.desc', {
                        strong: (chunks) => <strong>{chunks}</strong>
                      })}
                    </p>
                    <ul>
                      <li>{t('showcases.pathfinder.list.1')}</li>
                      <li>{t('showcases.pathfinder.list.2')}</li>
                      <li>{t('showcases.pathfinder.list.3')}</li>
                    </ul>
                  </div>
                </div>
              )}
              {activeTab === 'ios' && (
                <div className={styles.iosContent}>
                  <div className={`${styles.statusBadge} ${styles.planning}`}>
                    <span>{t('status.planning')}</span>
                  </div>
                  <h1 className={styles.title}>{t('showcases.ios.title')}</h1>
                  <p className={styles.description}>{t('showcases.ios.subtitle')}</p>
                  <div className={styles.content}>
                    <p>
                      {t.rich('showcases.ios.desc', {
                        strong: (chunks) => <strong>{chunks}</strong>
                      })}
                    </p>
                    <ul>
                      <li>{t('showcases.ios.list.1')}</li>
                      <li>{t('showcases.ios.list.2')}</li>
                      <li>{t('showcases.ios.list.3')}</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
            <div className={styles.dynamicContent}>
              {activeTab === 'web' && <WebVisual />}
              {activeTab === 'rrc-tracer-v1' && <OldRoboticsVisual />}
              {activeTab === 'rrc-tracer-v2' && <RoboticsVisual />}
              {activeTab === 'ios' && <IOSVisual />}
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  )
}
