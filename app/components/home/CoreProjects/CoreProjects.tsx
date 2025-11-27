'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './CoreProjects.module.scss'
import {
  faGlobe,
  faMobileScreenButton,
  faRobot,
} from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { WebVisual, RoboticsVisual, IOSVisual } from './Visuals'

export default function CoreProjects() {
  const [activeTab, setActiveTab] = useState<'robotics' | 'ios' | 'web'>('web')

  return (
    <section className={styles.coreProjects}>
      <div className={styles.coreProjectsContainer}>
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <h1>核心專案</h1>
            <p>我們將技術分層，每一層都追求極致的完成度。</p>
          </div>
          <div className={styles.switchContainer}>
            <button
              className={activeTab === 'robotics' ? styles.active : ''}
              onClick={() => setActiveTab('robotics')}
            >
              <FontAwesomeIcon icon={faRobot} />
              <span className={styles.buttonText}>Robotics</span>
            </button>
            <button
              className={activeTab === 'web' ? styles.active : ''}
              onClick={() => setActiveTab('web')}
            >
              <FontAwesomeIcon icon={faGlobe} />
              <span className={styles.buttonText}>Web Platform</span>
            </button>
            <button
              className={activeTab === 'ios' ? styles.active : ''}
              onClick={() => setActiveTab('ios')}
            >
              <FontAwesomeIcon icon={faMobileScreenButton} />
              <span className={styles.buttonText}>iOS App</span>
            </button>
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.staticContent}>
            {activeTab === 'web' && (
              <div className={styles.webContent}>
                <div className={styles.statusBadge}>
                  <span>上線中</span>
                </div>
                <h1 className={styles.title}>Web Platform</h1>
                <p className={styles.description}>網站平台</p>
                <div className={styles.content}>
                  <p>
                    基於 <strong>React & Next.js</strong>{' '}
                    建構的現代化入口。不只是展示面，更是展現我們對於 Web
                    前端技術與設計美感的堅持。
                  </p>
                  <ul>
                    <li>RWD 響應式設計</li>
                    <li>現代化動態特效</li>
                    <li>社員作品集展示平台</li>
                  </ul>
                </div>
                <div className={styles.actions}>
                  <button
                    onClick={() => {
                      window.open(
                        'https://github.com/johnlin10/robotctust.com',
                        '_blank'
                      )
                    }}
                  >
                    <FontAwesomeIcon icon={faGithub} />
                    <span className={styles.buttonText}>GitHub</span>
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'robotics' && (
              <div className={styles.roboticsContent}>
                <div className={styles.statusBadge}>
                  <span>規劃中</span>
                </div>
                <h1 className={styles.title}>Robotics</h1>
                <p className={styles.description}>社團機器人</p>
                <div className={styles.content}>
                  <p>
                    專為 <strong>AERC 亞洲智慧型機器人大賽</strong>{' '}
                    特製的競速、避障機器人。採用 Arduino 架構，搭配客製化 3D
                    列印底盤與高轉速馬達驅動。
                  </p>
                  <ul>
                    <li>PID 演算法自動修正路徑</li>
                    <li>紅外線感測器陣列</li>
                    <li>軟硬體協同開發</li>
                  </ul>
                </div>
                <div className={styles.actions}>
                  <button
                    onClick={() => {
                      window.open(
                        'https://github.com/robotctust/robotics',
                        '_blank'
                      )
                    }}
                  >
                    <FontAwesomeIcon icon={faGithub} />
                    <span className={styles.buttonText}>GitHub</span>
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'ios' && (
              <div className={styles.iosContent}>
                <div className={styles.statusBadge}>
                  <span>開發中</span>
                </div>
                <h1 className={styles.title}>iOS App</h1>
                <p className={styles.description}>iOS 應用程式</p>
                <div className={styles.content}>
                  <p>
                    使用 SwiftUI
                    原生開發。整合社團課程行事曆、即時推播與社員簽到系統。這不只是一個
                    App，而是社團數位轉型的核心樞紐。
                  </p>
                  <ul>
                    <li>SwiftUI 原生開發</li>
                    <li>社團課程行事曆</li>
                    <li>即時推播與社員簽到系統</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          <div className={styles.dynamicContent}>
            {activeTab === 'web' && <WebVisual />}
            {activeTab === 'robotics' && <RoboticsVisual />}
            {activeTab === 'ios' && <IOSVisual />}
          </div>
        </div>
      </div>
    </section>
  )
}
