'use client'

import { useState } from 'react'
import styles from './CoreProjects.module.scss'

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
  const [activeTab, setActiveTab] = useState<
    'rrc-tracer-v2' | 'rrc-tracer-v1' | 'ios' | 'web'
  >('rrc-tracer-v1')

  return (
    <section className={styles.coreProjects}>
      <div className={styles.coreProjectsContainer}>
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <ScrollAnimation animation="fadeInUp" once={false}>
              <h1>核心專案</h1>
            </ScrollAnimation>
            <ScrollAnimation animation="fadeInUp" once={false} delay={50}>
              <p>我們將技術分層，每一層都追求極致的完成度。</p>
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
                <span className={styles.buttonText}>啟蒙者</span>
              </button>
              <button
                className={activeTab === 'rrc-tracer-v2' ? styles.active : ''}
                onClick={() => setActiveTab('rrc-tracer-v2')}
              >
                <FontAwesomeIcon icon={faRobot} />
                <span className={styles.buttonText}>拓荒者</span>
              </button>
              <button
                className={activeTab === 'web' ? styles.active : ''}
                onClick={() => setActiveTab('web')}
              >
                <FontAwesomeIcon icon={faGlobe} />
                <span className={styles.buttonText}>
                  網站<span>平台</span>
                </span>
              </button>
              <button
                className={activeTab === 'ios' ? styles.active : ''}
                onClick={() => setActiveTab('ios')}
              >
                <FontAwesomeIcon icon={faMobileScreenButton} />
                <span className={styles.buttonText}>
                  <span>iOS </span>App
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
              {activeTab === 'rrc-tracer-v1' && (
                <div className={styles.oldRoboticsContent}>
                  <div className={styles.statusBadge}>
                    <span>正在使用</span>
                  </div>
                  <h1 className={styles.title}>Robot Mentor</h1>
                  <p className={styles.description}>
                    啟蒙者 - 循線避障入門機器人
                  </p>
                  <div className={styles.content}>
                    <p>
                      專為社團課程設計的 <strong>入門級輪型機器人</strong>。
                      採用高通用性的模組化設計，讓社員能快速理解感測器原理、馬達驅動與
                      Arduino 嵌入式邏輯，是進入機器人領域的最佳起點。
                    </p>
                    <ul>
                      <li>Arduino Nano 核心架構</li>
                      <li>模組化電路設計 (L9110S + KY-033)</li>
                      <li>循線 / 避障 多功能實作</li>
                    </ul>
                  </div>
                </div>
              )}
              {activeTab === 'rrc-tracer-v2' && (
                <div className={styles.roboticsContent}>
                  <div className={styles.statusBadge}>
                    <span>規劃中</span>
                  </div>
                  <h1 className={styles.title}>Robot Pathfinder</h1>
                  <p className={styles.description}>
                    拓荒者 - 競賽級自主研發計畫
                  </p>
                  <div className={styles.content}>
                    <p>
                      針對 <strong>循線、避障競賽</strong> 打造的高性能機種。
                      突破套件限制，由社團核心團隊 <strong>自主設計</strong>。
                      目標是實現高速循線與精準避障的完美平衡。
                    </p>
                    <ul>
                      <li>客製化 PCB 電路板與 3D 列印結構</li>
                      <li>PID 控制演算法與感測器陣列最佳化</li>
                      <li>軟硬體高度整合開發專案</li>
                    </ul>
                  </div>
                  {/* <div className={styles.actions}>
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
                  </div> */}
                </div>
              )}
              {activeTab === 'ios' && (
                <div className={styles.iosContent}>
                  <div className={styles.statusBadge}>
                    <span>開發中</span>
                  </div>
                  <h1 className={styles.title}>iOS App</h1>
                  <p className={styles.description}>iOS 平台應用程式</p>
                  <div className={styles.content}>
                    <p>
                      使用 <strong>SwiftUI 原生開發</strong>
                      。整合社團課程行事曆、即時推播與社員簽到系統。這不只是一個
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
